'use client'
export default function NotFount(){
    return <div className="background fc">
        <div>
            <div className="not-found-content">
                <h2>Oppps, you've stumbled on a page that doesn't exist</h2>
                <button onClick={()=>{
                    window.location = window.origin;
                }}>Click here to return home</button>
            </div>
        </div>
    </div>
}