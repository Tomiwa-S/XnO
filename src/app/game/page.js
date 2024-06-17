'use client'
import { useState, useEffect} from 'react';
import io from 'socket.io-client';
import './page.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
// const ip =  "http://localhost";

const socket = io('https://tictacserver.adaptable.app/');


export default function Page(props){
    
    const inviteId = props?.searchParams?.gid ?? false;
    const host = props?.searchParams?.host ?? false;

    const [cell, setCell] = useState(new Array(9).fill(""));
    const [isXNext, setIsXNext] = useState(true);
    const [gameId, setGameId] = useState(inviteId??null);
    const [gameActive, setGameActive] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(false);
    const [topText, setTopText] = useState(null);
    const [restartDialogue, setrestartDialogue] = useState(false);
    const [ruleDialogue, setRuleDialogue] = useState(false);
    const [score, setScore] = useState({x:0, o:0});
    const [inverted, setInverted] = useState(!!props?.searchParams.hasOwnProperty("i"));
    const [skipTurn, setSkipTurn] = useState(true);
    const [feedback, setFeedback] = useState(false);

    useEffect(() => {
        socket.on('gameCreated', (id) => {

            if(inverted){
            toast("The rules are inverted. If you win, you lose.")
              }
            setGameId(id);
            sessionStorage.setItem("xnoGid",id)
            const inviteLink =  window.location + "game?gid="+ id + (inverted?"&i":"");
            try{
                navigator.clipboard.writeText(inviteLink);
                toast("Invite Link Copied to clipboard");
            }catch{
                const copyTextArea = document.getElementById('copyTextArea');
                try{
                    
                    copyTextArea.value = inviteLink;
                    copyTextArea.select();
                    copyTextArea.setSelectionRange(0, 99999);
                    const successful = document.execCommand('copy');
                    if(successful) toast("Invite Link Copied to clipboard");
                }catch(e){
                    toast("Error copying invite link to clipboard",{type:"error"});
                    window.location = "/";
                }
            }

        });
        const draw = (cell)=>( cell.every(str => str !== ""));
        socket.on('gameState', (state) => {
            setScore(()=>({x:state.x , o:state.o}));
            setCell(state.cell);
            setIsXNext(()=>state.isXNext);
            var tap = new Audio("/tap.mp3");
            tap.play();
            
            if(state.checkWinner){
                setGameOver(()=>true)
                setWinner(()=>state.checkWinner);
                if(state.checkWinner.winner=='x'){
                    setTopText(()=>"❌ is the winner!!");
                }else{
                    setTopText(()=>"⭕ is the winner!!");
                }
                var winSound = new Audio('/win.mp3');
                winSound.play();
            }

            if(draw(state.cell) && !state.checkWinner) {
                setGameOver(()=>true);
                setTopText(()=>"The Game has ended in a draw");
                var gameOverSound = new Audio('/gameover.mp3');
                gameOverSound.play();
            }
            if(state.reset){
                setWinner(()=>false);
                setGameActive(()=>true);
                setGameOver(()=>false);
                setSkipTurn(()=>true);
            }

        });
        
        socket.on('setNewGame',(state)=>{
            setCell(state.cell);
            setIsXNext(()=>state.isXNext);
            var tap = new Audio("/tap.mp3");
            tap.play();
            setGameActive(()=>false);
            setWinner(()=>false)
            setGameActive(true);
            setSkipTurn(()=>true)
        })

        socket.on('error', (message) => {
            window.location = window.origin+"?error="+message;    
        });
        socket.on("confirmClear",(player)=>{
            if(host && player!="x"){
                setrestartDialogue(true)
            }
            else if(inviteId && player=="x"){
                setrestartDialogue(true)
            }
            
        });
        socket.on("confirmChange",(player)=>{
            if(host && player!="x"){
                setRuleDialogue(true)
            }
            else if(inviteId && player=="x"){
                setRuleDialogue(true)
            }
            
        });
        socket.on('broadcast',(data)=>{
            const {message, host} = data;
            let position = 'top-right';
            let customStyle = {right:0};
            if(!host & !inviteId){
                position = 'top-left';
                customStyle = {left:0};
            }
            if(host && inviteId){
                position='top-left';
                customStyle = {left:0};
            }
            var tap = new Audio("/tap.mp3");
            tap.play();
            const icon = host?"❌":"⭕";
            toast(icon + " : " +message,{
                
                
                hideProgressBar:true,
                
                
                style:{maxWidth:"50dvw",
                    position:"absolute",
                    ...customStyle
                },
                position:position,
                // className: "message",
                // style:`width:"fitContent"`
            })
        })
        socket.on("rulesChanged",()=>{
            setInverted(prev=>!prev);
        });
        socket.on('turnSkipped',()=>setSkipTurn(()=>false))
        return () => {
            socket.off('gameCreated');
            socket.off('gameState');
            socket.off('error');
            socket.off('broadcast');
            socket.off("confirmChange");
            socket.off("rulesChanged");
            socket.off('turnSkipped');
            sessionStorage.clear();
        };
    }, []);


    const x = ()=><span className='xno'>&#10060;</span>
    const o = ()=><span className='xno'>&#11093;</span>
     const createGame = () => {
        socket.emit('createGame');
        setGameActive(()=>true);
        
    }

    const joinGame = (id) => {
        setGameId(()=>id);
        socket.emit('joinGame', id);
        setGameActive(()=>true);
        if(inverted){
            toast("The rules are inverted. If you win, you lose.")
        }
    }
    useEffect(()=>{
        if(host){
            const gameId = sessionStorage.getItem("xnoGid");
            !!gameId? joinGame(gameId): createGame();
        }
        if(inviteId) {
            joinGame(inviteId);
        }
    },[]);
    const handleChange = (i, gameId)=>{  
        if(cell[i]=="" && gameId){
                socket.emit('makeMove', { gameId, index: i, invert:inverted });
                
        }
        
    }
    const PlayerTurn = ()=>{
        if(!!host){
            return isXNext;
        }
        return !isXNext;
    }
    const renderCell = ()=>(
        new Array(9).fill('').map((_,i)=>(
            <div key={i} className={`cell fc
            ${(i==2||i==5||i==8) ? 'rc': ""}
            ${(i==6||i==7||i==8) ? 'bc': ""}
            `}
            onClick={()=>(!gameOver && PlayerTurn()) ? handleChange(i, gameId) : null}
            >
            {cell[i]=="x"?x() :
            cell[i]=="o"? o():
            cell[i]}
            </div>
        ))
    )
    const sendChat = (e)=>{
        e.preventDefault();
        const message = new FormData(e.target)?.get('chat');
        if(!gameId || !message){
            return ;
        }
        if(!!message){
            socket.emit("send-message",{
                message:message,
                gameId:gameId,
                host: !!host
            })
        }
        document.getElementById("chat").value="";

    }
    const skip = ()=>{
        // setIsXNext((prev)=>!prev);
        setSkipTurn(()=>false);
        socket.emit('skipTurn', {gameId:gameId, isXNext:!isXNext});
    }
    return (<>

    <div className='fc body'>
    <ToastContainer/>
    <span className='score'>
        <p>{(host?"You(❌) :" : "❌: ") + score.x}</p>
        <p>{(!host?"You(⭕):" : "⭕: ") + score.o}</p>
    </span>
    <span className='turn'>
        {!gameOver && (PlayerTurn() ?  "Your Turn" : 
            isXNext? "❌'s turn to play" :
            "⭕'s turn to play")
        }
        {gameOver && topText}
    </span>
    <span className={`restart-confirmation fc  ${!restartDialogue && "hide"}`}>
        {host?"⭕ wants to restart":"❌ wants to restart"}
        <section>
            <button className='choice n' onClick={()=>setrestartDialogue(()=>false)}>NO</button>
            <button className='choice y'
                onClick={()=>{
                    socket.emit('makeMove', { gameId, index: 1, reset:true });
                    setrestartDialogue(()=>false);
                }}
            >YES</button>
        </section>
    </span>
    <span className={`restart-confirmation fc  ${!ruleDialogue && "hide"}`}>
        {host?"⭕ wants to change to ":"❌ wants to change to "}
        {inverted?" Normal Rules": " Inverted Rules"}
        <section>
            <button className='choice n' onClick={()=>setRuleDialogue(()=>false)}>NO</button>
            <button className='choice y'
                onClick={()=>{
                    socket.emit('changeRulesConfirm',gameId);
                    setRuleDialogue(()=>false);
                }}
            >YES</button>
        </section>
    </span>
        <div className='board-container'>
        <input type='text' id='copyTextArea' style={{display:"none"}}></input>
        {feedback && <div className='feedback-container fc'>
        <span className='feedback-close'
            onClick={()=>setFeedback(()=>false)}
        >❌</span>
        <iframe className='feedback fc'
         src="https://docs.google.com/forms/d/e/1FAIpQLScJlls-E7xr4_uR8m0hLfIsh0goa9C_3PAYFp4PAQL8dA3LHA/viewform?embedded=true"  
         frameborder="0" marginheight="0" marginwidth="0">
         
         </iframe>
         </div>
         }
            <div className='board fc'>
                {renderCell()}
                <span className={`cross-out ${ winner ? winner?.className : "hide"}`}></span>
            </div>
            <i className="fa-solid fa-comment fa-bounce fa-2xl feedback-icon" onClick={()=>{
                setFeedback(prev=>!prev)
                }}></i>
            <Link href={"https://buymeacoffee.com/xno_"} className='donate' target='_blank'>
            <i className="fa-solid fa-circle-dollar-to-slot fa-lg fa-2xl"></i>
            </Link>
            <div className={gameActive ? 'hide':""}>
                <button onClick={createGame}>Create Game</button>
                <input type="text" placeholder="Game ID" onBlur={(e) => joinGame(e.target.value)} />
            </div>
        </div>
        {cell.every(str => str == "") && skipTurn && PlayerTurn() && <button className='skip-turn'
            onClick={skip}
        >Skip Turn</button>}
        <form className='chat fc' onSubmit={(e)=>sendChat(e)}>
            <textarea type='text' id='chat' placeholder='Send a chat' name="chat"/>
            <button type='submit'>Send</button>
        </form>
        <button className='clear-board' onClick={()=>{
                    socket.emit("clear", {gameId:gameId, player:host?"x":"o"});
                    toast(`Waiting for ${!host ? "❌" : "⭕"}'s response`)
            }}>Clear board</button>
        <button className='rules' onClick={()=>{
                    socket.emit("changeRules", {gameId:gameId, player:host?"x":"o"});
                    toast(`Waiting for ${!host ? "❌" : "⭕"}'s response`)
            }}>
            {inverted?"Normal Rules":"Inverted Rules"}
            </button>
    </div>
    </>)
}