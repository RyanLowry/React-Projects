import { useEffect } from 'react';
import { useState, useRef, memo } from 'react';

// Component that allows search for page that doesn't show at bottom of screen
function WordPageSearch(props) {
    const [show, setShow] = useState(false)
    const input = useRef(null)

    useEffect(() => {
        if (show) {
            input.current.focus();
        }
    }, [show])

    return (
        <div className='relative'>
            <button className={`${props.currPage == props.ind ? 'bg-slate-700 text-slate-200' : 'bg-slate-400'} my-8 mx-1 px-1 py-1 md:min-w-[50px] min-w-[25px]`} key={props.ind} onClick={() => { setShow(!show) }}>...</button>
            {show ? <input ref={input} type='number' className='border-2 bg-slate-200 absolute top-[-10px] left-[5px] w-12' onKeyPress={(e) => { if (e.key === "Enter") { setShow(false); props.updatePage(parseInt(e.target.value)) } }}></input> : null}
        </div>
    )
}

// component for pageing functionality
const WordPages = memo(function WordPages(props) {
    let wordPerPage = useRef(200)
    let [pages, setPages] = useState(0)
    let [currPage, setCurrPage] = useState(1)

    useEffect(() => {
        setPages(Math.ceil(props.allWords.length / wordPerPage.current))
    }, [props.allWords])

    // function that creates the nav functionality at the bottom of the screen
    function navButtons() {
        let eles = [];
        for (let i = 1; i < pages + 1; i++) {
            if (i == 1 || (i > currPage - 3 && i < currPage + 3) || i == pages) {
                eles.push(
                    <button  className={`${currPage == i ? 'bg-slate-700 text-slate-200' : 'bg-slate-400'} my-8 mx-1 px-1 py-1 md:min-w-[50px] min-w-[25px]`} key={i} onClick={() => { setCurrPage(i) }}>{i}</button>
                )
            } else if ((i == 2 || i == pages - 1) && (i < currPage - 2 || i > currPage + 2)) {
                eles.push(
                    <WordPageSearch key={i} currPage={currPage} ind={i} updatePage={(ind) => ind > 0 && ind < pages + 1 ? setCurrPage(ind) : null}></WordPageSearch>
                )
            }
        }
        return eles;
    }

    return (
        <div className='flex flex-col items-center justify-between h-[90vh]'>
            <div className='flex flex-wrap align-center justify-center overflow-y-auto'>
                {
                    props.allWords.slice((currPage - 1) * wordPerPage.current, currPage * wordPerPage.current).map((item) => {
                        return (
                            <div key={item} className='rounded-lg text-slate-200 bg-slate-700 border-solid border-slate-800 hover:bg-slate-800 mx-2 my-1 px-6 py-2' onClick={() => { props.addWord(item) }}>{item}</div>
                        )
                    })
                }
            </div>
            <div className='flex justify-between content-between'>
                {
                    navButtons()
                }
            </div>

        </div>
    )
});

// Component for infinite scrolling functionality
const WordsInfinite = memo(function WordsInfinite(props) {
    const [renderedWords, setRenderedWords] = useState([]);
    const [availableWords, setAvailableWords] = useState(0);
    const bottomObserver = useRef(null);
    const topObserver = useRef(null);
    //use a timeout here because it helps with jitteryness and also seems to help the observer not miss an intersection
    let observerTimeout = null

    // this uses 2 observers for top and bottom checks as an experiment to only show a certain number of items from an array
    // This would normally work with fetch to load data instead of an already loaded wordlist
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    if (observerTimeout) clearTimeout(observerTimeout)
                    observerTimeout = setTimeout(()=>{
                        setAvailableWords(a => a < props.allWords.length ? a + 500 : a)
                    },200)

                }
            },

            { threshold: .9 }
        );

        if (bottomObserver.current) {
            observer.observe(bottomObserver.current);
        }
        const observer2 = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    if (observerTimeout) clearTimeout(observerTimeout)
                    observerTimeout = setTimeout(()=>{
                        setRenderedWords(w => {
                            return removeWords(500, w);
                        })
                        // only remove words if > 0
                        setAvailableWords(a => a > 0 ? a - 500 : a);
                    },200)


                }
            },
            { threshold: .9 }
        );

        if (topObserver.current) {
            observer2.observe(topObserver.current);
        }
        return () => {
            if (bottomObserver.current) {
                observer.unobserve(bottomObserver.current);
            }
            if (topObserver.current) {
                observer2.unobserve(topObserver.current);
            }
        };
    }, []);

    useEffect(() => {
        if (props.allWords.length == 0) return;
        setRenderedWords([]);
        setAvailableWords(500)
    }, [props.allWords])

    useEffect(() => {
        fillWords();
    }, [availableWords])

    // fills words from start to end
    function fillWords() {
        if (availableWords == 0) return;
        let startPos = renderedWords.length;
        let newWords = [];
        let reachedEnd = false;
        for (let i = startPos; i <= availableWords; i++) {
            if (props.allWords[i] == undefined) {
                reachedEnd = true;   
                break;
            }
            newWords.push(props.allWords[i]);
        }
        if (reachedEnd) window.scrollTo(0, window.scrollY - 300);
        renderedWords.length == 0 ? setRenderedWords(newWords) : setRenderedWords(renderedWords.concat(newWords));
    }
    function removeWords(removeableWords, _words) {
        if (removeableWords <= 0 || _words.length < 1000) return _words;
        let newWords = [..._words];
        // could probably use slice here, but an easy way to remove x number of items in an array from the end.
        for (let i = 0; i <= removeableWords; i++) {
            newWords.pop();
        }
        // add this here because we don't want to scroll if no items have been removed
        window.scrollTo(0, window.scrollY + 300);

        return newWords
    }

    return (
        <div>
            {/* heights seem to work better for the intersectors, but they aren't required */}
            <div className='h-2' ref={topObserver} key='topObserver'></div>
            <div className='flex flex-wrap align-center justify-center'>
                {
                    //only show last x items from rendered words, remove the slice if you want to show all words from beginning
                    renderedWords.slice(-1500).map((item, index) => {
                        return (
                            <div>
                                <div key={item} className='rounded-lg text-slate-200 bg-slate-700 border-solid border-slate-800 hover:bg-slate-800 mx-2 my-1 px-6 py-2' onClick={() => { props.addWord(item) }}>{item}</div>
                            </div>

                        )
                    })
                }
            </div>
            <div className='h-2' ref={bottomObserver} key='bottomObserver'></div>
        </div>
    )
})

export { WordPages, WordsInfinite }