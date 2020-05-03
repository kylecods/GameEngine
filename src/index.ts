import { Game } from "./Game"


window.onload = () =>{  
    //pass here the canvas and resize of the screen
    let engine = new Game(document.getElementById("viewport") as HTMLCanvasElement);
    engine.resizeScreen(window.innerWidth,window.innerHeight);   
    engine.wgl();

    window.addEventListener("resize", ()=>{
        engine.resizeScreen(window.innerWidth,window.innerHeight);
    });
   
}

