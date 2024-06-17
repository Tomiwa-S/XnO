'use client';
import Image from 'next/image';
import { useState,useEffect } from 'react';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function Home(props) {
  const error = props?.searchParams?.error ?? false;
  const [div, setDiv] = useState(false);
  const [name, setName] = useState('');


  function getName(e){
    e.preventDefault();
    const form = new FormData(e.target);
    const player = form.get("player");
    sessionStorage.setItem('host', player);
    setName(()=>player);
    setDiv(()=>true);
  }
  useEffect(()=>{
    if(!!error) toast(error);
    sessionStorage.clear();
  })
  return (
    <div className='background fc'>
    <ToastContainer/>
    
      <div className='welcome-player fc'>
      <h1 className='title'>&#10060; n&#39; &#127358;</h1>
      <div className={`${div && 'hide'}`}>
      <form className='fc' onSubmit={(e)=>getName(e)}>
        <input type='text' name='player' required placeholder='Please enter your name'/><br/>
        
        <button type='submit'>Continue</button>
      </form>
      </div>
      <div className={`${!div && 'hide'}`}>
        <p className='greeting'>Hello, <strong><i>{name}</i></strong></p>
            <Link href={'/game?host=true'}><button className='game-type'>Normal Game</button></Link>
            <div className='space'></div>
            <Link href={'/game?host=true&i'}><button className='game-type'>Inverted Rules</button></Link>
      </div>
      </div>
    </div>
  )
}
