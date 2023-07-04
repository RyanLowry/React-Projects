import { useEffect } from 'react';


function Timepicker(props) {
    return (
        <div className="flex items-center justify-around">
            <div className='mr-10'>
                <label className="text-slate-950 text-base"
                    htmlFor="startTime">Start:</label>
                <input className="text-slate-950 text-base"
                    onChange={(e) => { props.setStart(e.target.value) }}
                    value={props.start}
                    type="time"
                    id="startTime" />
            </div>
            <div>
                <label className="text-slate-950 text-base"
                    htmlFor="endTime">End:</label>
                <input className="text-slate-950 text-base"
                    onChange={(e) => { props.setEnd(e.target.value) }}
                    value={props.end}
                    type="time"
                    id="endTime" />
            </div>
        </div>
    )
}

function ErrorToast(props) {

    //closes the toast after 5 seconds
    useEffect(() => {
        const timeout = setTimeout(() => {
            props.onClose();
        }, 5000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">{props.text}</strong>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <button className="fill-current h-6 w-6 text-red-500" onClick={() => props.onClose()}><strong>X</strong></button>
            </span>
        </div>
    )
}

function Dropdown(props) {
    return (
        <div className="flex items-center justify-center">
            <label htmlFor="rooms" className="block mb-2 mr-4 text-base font-medium text-slate-950">Select a room</label>
            <select onChange={(e) => { props.onSelect(e.target.value) }} id="rooms" className="bg-slate-50 border border-slate-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-20 p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option>any</option>
                {
                    props.rooms.map(item => {
                        return (
                            <option key={item} value={item}>{item}</option>

                        )
                    })
                }
            </select>
        </div>
    )
}

function MeetingButtons(props) {
    return (
        <div className="flex items-center justify-around">
            <button className="bg-slate-800 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded mr-10" onClick={() => props.onSubmit()}>
                {props.meeting ? 'Update' : 'Create'}
            </button>
            {props.meeting ? <button className="bg-red-950 hover:bg-red-600 text-white font-bold py-2 px-4 rounded" onClick={() => { props.onCancel() }}>Cancel</button> : null}
        </div>
    )
}

export { Timepicker, ErrorToast, Dropdown, MeetingButtons }