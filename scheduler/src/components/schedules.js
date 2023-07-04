import { createRef, useEffect, useMemo, useRef, useState } from 'react';
import MeetingItems from './Meetings.js'
import { Timepicker, Dropdown, ErrorToast, MeetingButtons } from './ui.js'
import Meeting from '../data/meeting.js'
import '../App.css';



function Schedules() {
  // use ref here just because we aren't using a database to store/access these and it's an easy although odd way to update/add information
  // would probably be easier to just usestate from the beginning instead of a separate value for these.
  const currentMeetings = useRef([new Meeting(60, 120, 'any'), new Meeting(121, 180, '1'), new Meeting(60, 105, '2'), new Meeting(50, 100, '3')]);

  const [meetings, setMeetings] = useState({});

  // I'd like to useref on these but it won't update when a meeting is selected.
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showError, setShowError] = useState('');

  const rooms = useRef(['1', '2', '3']);
  const selectedRoom = useRef('any');

  const [meeting, setMeeting] = useState(null);

  const grid = [...Array(24).keys()]

  const scrollElement = createRef();
  let pos = { top: 0, left: 0, x: 0, y: 0 };


  useMemo(() => {
    fillMeetings();
  }, [])

  useEffect(() => {
    scrollElement.current.addEventListener('mousedown', mouseDownHandler);
    return () => {
      if (scrollElement.current) { scrollElement.current.removeEventListener('mousedown', mouseDownHandler) }
    }
  }, [scrollElement])

  useEffect(() => {
    if (!meeting) {
      setStartTime(''); setEndTime(''); return;
    }
    else {
      let startHours = Math.floor(meeting.start / 60).toString();
      startHours = startHours < 10 ? startHours.padStart(2, '0') : startHours;
      let startMins = (meeting.start % 60).toString();
      startMins = startMins < 10 ? startMins.padStart(2, '0') : startMins;

      let endHours = Math.floor(meeting.end / 60).toString();
      endHours = endHours < 10 ? endHours.padStart(2, '0') : endHours;
      let endMins = (meeting.end % 60).toString();
      endMins = endMins < 10 ? endMins.padStart(2, '0') : endMins;

      setStartTime(startHours + ':' + startMins);
      setEndTime(endHours + ':' + endMins);
    }
  }, [meeting])

  function fillMeetings() {
    let meetingValues = rooms.current.reduce((acc, curr) => (acc[curr] = [], acc), {});

    // runs through each section and places the item inside it. If the section is occupied then it will check the other sections to place it inside it.
    // could probably condense this by making an extra function since these 2 blocks inside here do essentially the same thing.
    for (let [ind, meeting] of currentMeetings.current.entries()) {

      // variable as a flag to determine if a meeting is put inside a section or not
      let putInside = false;
      // first check the section the meeting wants to be apart of
      if (meeting.section in meetingValues) {
        let obj = meetingValues[meeting.section];
        // logic to make sure there are no conflicts with already defined items
        if (obj.every(element => {
          if (element.end <= meeting.start || meeting.end <= element.start) {
            return true;
          }
        })) {
          obj.push(meeting);
          putInside = true;
        };
        if (putInside) {
          continue;
        }
      }

      // if the top fails, checks the other rooms 1 -> x but could realistically be sorted in any way for priority
      for (let [index, obj] of Object.entries(meetingValues)) {
        // we already checked this section above
        if (meeting.section === index) {
          continue;
        }
        if (obj.every(element => {
          if (element.end <= meeting.start || meeting.end <= element.start) {
            return true;
          }
        })) {
          // we want to make sure it sets the correct section if it gets placed there. Also used for the 'any' section.
          if (meeting.section != index) {
            meeting.section = index;
          }
          obj.push(meeting);
          putInside = true;
        };
        // we don't want to loop anymore if we already place it
        if (putInside) {
          break;
        }
      }
      // this should really just throw an error, but quick check and return to make sure values don't stay in the reference if the item wasn't placed anywhere
      if (!putInside) {
        setShowError('Unable to add Item');
        return 'error';
      }

    }
    setMeetings(meetingValues);
  }

  function createTime() {
    let start = parseInt(startTime.split(':')[0] * 60) + parseInt(startTime.split(':')[1])
    let end = parseInt(endTime.split(':')[0] * 60) + parseInt(endTime.split(':')[1])

    if (start > end) {
      setShowError('start time must be earlier than end time');
      return;
    }

    if (meeting) {
      let updateMeeting = currentMeetings.current.find(item => item.id == meeting.id);
      let oldDept = updateMeeting.section;
      if (selectedRoom.current != 'any') {
        let obj = meetings[selectedRoom.current];
        if (obj.every(element => {
          if (element.id != updateMeeting.id) {
            if ((element.end <= start || end <= element.start)) {
              return true;
            }
          } else {
            return true;
          }

        })) {
          updateMeeting.section = selectedRoom.current;
          updateMeeting.start = start;
          updateMeeting.end = end;
          updateMeeting.isSelected = false;
          console.log(oldDept)
          setMeetings({ ...meetings, [oldDept]: meetings[oldDept].filter(item => item != updateMeeting), [selectedRoom.current]: [...meetings[selectedRoom.current], updateMeeting] })
          setMeeting(null);
          setStartTime('');
          setEndTime('');
        } else {
          setShowError('There was a timing conflict');
        }
      } else{
      setShowError('Enter a specific room when updating meetings');
      }
    } else {
      currentMeetings.current.push(new Meeting(start, end, selectedRoom.current));

      if (fillMeetings() == 'error') {
        currentMeetings.current.pop();
      }
    }
  }

  // event on drop, used inside meetings.js from ondrag
  function moveItem(ev) {
    ev.preventDefault();
    let section = ev.currentTarget.id.split('-')[1];
    var data = ev.dataTransfer.getData("text");
    let meeting = currentMeetings.current.find((item) => item.id == data);
    // don't update info if we drop in same section
    if (!meeting) return;
    if (meeting.section == section) return;

    let obj = meetings[section];
    if (obj.every(element => {
      if (element.end <= meeting.start || meeting.end <= element.start) {
        return true;
      }
    })) {
      let oldDept = meeting.section;
      meeting.section = section;
      // meeting.changedDept = false;
      setMeetings({ ...meetings, [oldDept]: meetings[oldDept].filter(item => item != meeting), [section]: [...meetings[section], meeting] })

    } else {
      setShowError('There was a timing conflict');
    }

  }



  // the events used to move the schedule container
  function mouseDownHandler(e) {
    if (scrollElement.current) {
      pos = {
        left: scrollElement.current.scrollLeft,
        top: scrollElement.current.scrollTop,
        x: e.clientX,
        y: e.clientY,
      };
      scrollElement.current.addEventListener('mousemove', mouseMoveHandler);
      scrollElement.current.addEventListener('mouseup', mouseUpHandler);
    }
  };
  function mouseMoveHandler(e) {
    if (scrollElement.current) {
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;

      scrollElement.current.scrollTop = pos.top - dy;
      scrollElement.current.scrollLeft = pos.left - dx;
    }
  };
  function mouseUpHandler() {
    if (scrollElement.current) {
      scrollElement.current.removeEventListener('mousemove', mouseMoveHandler);
      scrollElement.current.removeEventListener('mouseup', mouseUpHandler);
    }
  };



  return (
    <div className="min-w-0">
      <div className='h-12'>
        {showError != '' ? <ErrorToast className='h-fit' text={showError} onClose={() => { setShowError('') }}></ErrorToast> : null}
      </div>
      <div className="flex flex-col items-center md:flex-row w-full justify-items-center justify-around basis-1/8 max-w-[950px] w-[950px] h-48 md:h-auto">
        <Dropdown rooms={rooms.current} currRoom={meeting ? meeting.section : null} onSelect={(item) => selectedRoom.current = item}></Dropdown>
        <Timepicker start={startTime} end={endTime} setStart={(time) => setStartTime(time)} setEnd={(time) => setEndTime(time)}></Timepicker>
        <MeetingButtons meeting={meeting} onSubmit={() => { createTime() }} onCancel={() => { meeting.isSelected = false; setMeeting(null) }}></MeetingButtons>
      </div>
      <div className='overflow-x-auto h-full scrollbar-hide cursor-grab' ref={scrollElement}>
        <div className='w-grid whitespace-nowrap h-full' >
          <div className="mt-12 flex">
            {
              grid.map((item, ind) => {
                return (
                  <div className="w-full text-slate-950 bg-slate-400" key={item}>
                    {
                      ind == 0 ? 12 + 'AM' : ind <= 12 ? ind + 'AM' : ind - 12 + 'PM'
                    }
                  </div>
                )
              })
            }
          </div>
          {
            Object.keys(meetings).map(item => {
              return (
                <div key={item} onDrop={moveItem} onDragOver={(ev) => { ev.preventDefault(); }} id={`section-${item}`}>
                  <MeetingItems schedule={meetings[item]} onSelect={(item) => { if (meeting != null) { meeting.isSelected = false }; item.isSelected = true; selectedRoom.current = item.section; setMeeting(item) }}></MeetingItems>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}



export default Schedules;


