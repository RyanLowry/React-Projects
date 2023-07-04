import { useState } from 'react';


function MeetingSchedule(props) {
  const [showCard, setShowCard] = useState(null);

  // realtes to ondrop event inside schedules.js
  function onDrag(event) {
    event.dataTransfer.setData("text", props.meeting.id);
    setShowCard(false);
  }
  return (
    <div style={{ marginTop: '0px' }} className='relative select-none cursor-default'>
      <div draggable onDragStart={onDrag} onClick={() => { props.selectMeeting(props.meeting) }}
        className={`${props.meeting.isSelected ? 'bg-slate-600' : props.meeting.changedDept ? 'bg-red-950' : 'bg-slate-800'} absolute h-5 my-[12px]`}
        style={{ left: ((((props.meeting.start) / (24 * 60))) * 1920) + 'px', width: ((props.meeting.end - props.meeting.start) / (24 * 60)) * 1920 + 'px' }}
        onMouseEnter={(e) => { setShowCard(true) }} onMouseLeave={() => { setShowCard(false) }}>

        {showCard ? <div className="bg-slate-500" style={{ position: 'absolute', left: '50px', top: '-50px', zIndex: '5', minWidth: '100px' }}>

          <div>start: {Math.floor(props.meeting.start / 60).toString().padStart(2, '0') + ':' + (props.meeting.start % 60).toString().padStart(2, '0')}</div>
          <div>end: {Math.floor(props.meeting.end / 60).toString().padStart(2, '0') + ':' + (props.meeting.end % 60).toString().padStart(2, '0')}</div>
          <div>section: {props.meeting.section}</div>
        </div> : null}
      </div>
    </div>
  )
}

function MeetingItems(props) {
  return (
    <div className="border-solid border-slate-200 border-2" style={{ display: 'flex', height: '51px' }}>
      {
        //divs for border for chart, relative to ignore size of div
        Array(24).fill(0).map((item, ind) => {
          return (
            <div key={ind} className='relative'>
              <div style={{ left: ((((ind * 60) / (24 * 60))) * 1920) + 'px', width: 1 + 'px' }} className='absolute border-solid border-slate-200 border-[1px] min-h-[50px]'></div>
            </div>
          )
        })
      }
      {
        props.schedule.map(item => {
          return (
            <div key={item.id}>
              <MeetingSchedule meeting={item} selectMeeting={(item) => { props.onSelect(item) }}></MeetingSchedule>
            </div>
          )
        })
      }
    </div>
  )
}

export default MeetingItems;