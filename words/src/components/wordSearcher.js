import { useEffect } from 'react';
import data from '../data/enable1.txt';
import { useState, useRef, memo } from 'react';
import { WordsInfinite, WordPages } from './searchType.js'


function WordSearch() {
    const [filteredWords, setFilteredWords] = useState([]);
    const [displayType, setDisplayType] = useState('Pages');
    const [options, setOptions] = useState([]);
    const allWords = useRef([]);
    const inputValue = useRef(null);

    useEffect(() => {
        // gets all information from the enable1 word list
        fetch(data)
            .then(r => r.text())
            .then(text => {
                allWords.current = text.split('\r\n');
                // remove the empty first item in array
                allWords.current.shift();
                setFilteredWords(allWords.current);
            });

    }, [])

    //use only if we want to change data on option click
    // useEffect(() => {
    //     filterWords(options);
    // }, [options])


    // filteredWords will include each filtered values separately, so if length and contains is selected, it will show words that also aren't the specified length
    function filterWords(options) {
        let filter = [];
        if (inputValue.current.value === '') {
            filter = allWords.current;
        }
        else if (options.length == 0) {
            filter = allWords.current.filter((item) => {
                return item.startsWith(inputValue.current.value);
            });
        } else {
            filter = allWords.current.filter((item) => {
                let type = {};
                let isFilter = true
                if (options.includes('startsWith')) {
                    isFilter = item.startsWith(inputValue.current.value);
                    type.startsWith = isFilter
                }
                if (options.includes('length')) {
                    item.length == inputValue.current.value.length ? isFilter = true : isFilter = false;
                    type.length = isFilter
                }
                if (options.includes('endsWith')) {
                    isFilter = item.endsWith(inputValue.current.value);
                    type.endsWith = isFilter;
                }
                if (options.includes('contains')) {
                    isFilter = item.includes(inputValue.current.value);
                    type.contains = isFilter;
                }
                return Object.values(type).some(item => item == true);
            });
        }

        setFilteredWords(filter)

    }

    return (
        <div className="App h-fit flex flex-col justify-between content-between">
            <div className='sticky top-0 bg-slate-100 h-[10vh]'>
                <div className='flex items-center justify-center'>
                    <div>
                        <select onChange={(e) => { setDisplayType(e.target.value) }}>
                            <option>Pages</option>
                            <option>Infinite</option>
                        </select>
                    </div>
                    <div >
                        <input for='search' ref={inputValue} class="ml-6 border-2 border-slate-800 w-32"></input>
                        <button className='rounded-lg text-slate-200 bg-slate-700 border-solid border-slate-800 hover:bg-slate-800 mx-4 my-1 px-4 py-1' onClick={() => filterWords(options)} >SEARCH</button>
                    </div>
                </div>
                <div>
                    <div className="flex justify-around border-solid border-2 rounded-lg bg-slate-700 divide-x">
                        <button className={`text-slate-200 hover:bg-slate-400 px-2 flex-1 ${options.includes('startsWith') ? 'bg-slate-400' : 'bg-slate-700'}`} onClick={() => { options.includes('startsWith') ? setOptions(options.filter((item) => item != 'startsWith')) : setOptions([...options, 'startsWith']) }}>
                            Starts With
                        </button>
                        <button className={`border-right text-slate-200 hover:bg-slate-400 px-2 flex-1 ${options.includes('contains') ? 'bg-slate-400' : 'bg-slate-700'}`} onClick={() => { options.includes('contains') ? setOptions(options.filter((item) => item != 'contains')) : setOptions([...options, 'contains']) }}>
                            Contains
                        </button>
                        <button className={`border-right text-slate-200 hover:bg-slate-400 px-2 flex-1 ${options.includes('length') ? 'bg-slate-400' : 'bg-slate-700'}`} onClick={() => { options.includes('length') ? setOptions(options.filter((item) => item != 'length')) : setOptions([...options, 'length']) }}>
                            Length
                        </button>
                        <button className={`border-right text-slate-200 hover:bg-slate-400 px-2 flex-1 ${options.includes('endsWith') ? 'bg-slate-400' : 'bg-slate-700'}`} onClick={() => { options.includes('endsWith') ? setOptions(options.filter((item) => item != 'endsWith')) : setOptions([...options, 'endsWith']) }}>
                            Ends With
                        </button>
                    </div>
                </div>
            </div>
            {
                displayType === 'Pages' ?
                    <WordPages allWords={filteredWords} addWord={(item) => { inputValue.current.value = item }}></WordPages>
                    :
                    <WordsInfinite allWords={filteredWords} addWord={(item) => { inputValue.current.value = item }}></WordsInfinite>
            }

        </div>
    );
}

export default WordSearch;
