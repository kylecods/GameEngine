import { Engine, Vector2,Sprite,BackBuffer} from "./Engine";

export class Game extends Engine{
    sp2:Sprite;
    
    constructor(cnvs: HTMLCanvasElement) {
        super(cnvs);
        //init here
        
        this.vertsh = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;

            uniform mat3 u_world;
            uniform mat3 u_object;
            uniform vec2 u_frame;

            varying vec2 v_texCoord;
            void main(){
                gl_Position = vec4(u_world * u_object * vec3(a_position,1),1);
                v_texCoord = a_texCoord + u_frame;
            }
        `;
        this.fragsh = `
            precision mediump float;
            uniform sampler2D u_image;
            uniform vec4 u_color;
            varying vec2 v_texCoord;
            void main(){
                gl_FragColor = u_color * texture2D(u_image, v_texCoord);
            }
        `;

        this.backBuffer = new BackBuffer(this.gl,true,new Vector2(1920,1080));
        this.lightBuffer = new BackBuffer(this.gl,true,new Vector2(256,256));
        this.sp = new Sprite(this.gl,"./src/manonfire.png",this.vertsh,this.fragsh,this.worldSpace,true,new Vector2(48,48));
        this.sp1 = new Sprite(this.gl, "./src/walker.png", this.vertsh, this.fragsh,this.worldSpace,true,new Vector2(64,64));
        this.sp2 = new Sprite(this.gl, "./src/linkFormatted.png", this.vertsh, this.fragsh,this.worldSpace,true,new Vector2(32,32));


        this.halo = new Sprite(this.gl, "./src/halo.gif", this.vertsh, this.fragsh,this.worldSpace,true,new Vector2(256,256));
        this.white = new Sprite(this.gl, "./src/white.png", this.vertsh, this.fragsh,this.worldSpace,true,new Vector2(1,1));


        this.spvec = new Vector2(0,0);
        this.sppos = new Vector2(0,0);

        this.sp1vec = new Vector2(0,0);
        this.sp1pos = new Vector2(0,0);
        
    
    }
    
   
    update(): void {
      
        //movement and input here
       
        this.spvec.setX(0);
        //this.spvec.setY((new Date().getTime() * 0.006) % 8 );

        this.sp1vec.setX((new Date().getTime() * 0.006) % 3 );
        this.sp1vec.setY((new Date().getTime()* 0.002) % 2 );

        //right
        if( this.input.isKeyDown(68)){
            this.spvec.setY(0);
            this.sp1pos.setX((this.sp1pos.getX() + 2));
            this.spvec.setX((new Date().getTime() * 0.01) % 8 );
        }
       

        //up
        if( this.input.isKeyDown(87)){
            this.spvec.setY(3);
            this.sp1pos.setY((this.sp1pos.getY() - 2));
            this.spvec.setX((new Date().getTime() * 0.01) % 8 );
        }
        //down
        if( this.input.isKeyDown(83)){
            this.spvec.setY(2);
            this.sp1pos.setY((this.sp1pos.getY() + 2));
            this.spvec.setX((new Date().getTime() * 0.01) % 8 );
        }
        //left
        if( this.input.isKeyDown(65)){
            this.spvec.setY(1);
            this.sp1pos.setX((this.sp1pos.getX() - 2));
            this.spvec.setX((new Date().getTime() * 0.01) % 8 );
        }

        //clamp postions to screen size
        if(this.sp1pos.x < -20){
            this.sp1pos.x = -20;
        }else if(this.sp1pos.x > this.canvas.width){
            this.sp1pos.x = this.canvas.width;
        }
        if(this.sp1pos.y < -20){
            this.sp1pos.y = -20;
        }else if(this.sp1pos.y > 200){
            this.sp1pos.y = 200;
        }

        console.log("X: " + this.sp1pos.x);
        console.log("Y: " + this.sp1pos.y);
        
     
    }
    renderer(): void {
        this.setBuffer();
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        //render sprites on buffer on top of canvas
        this.setBuffer(this.backBuffer);
        //sprites
        // this.sp.render(this.sppos,this.spvec);sd
        // this.sp1.render(this.sp1pos,this.sp1vec);
        this.sp2.render(this.sp1pos, this.spvec);
    
        
        // //effects buffer
        // this.setBuffer(this.lightBuffer);
        // this.white.render(new Vector2(0,0),new Vector2(0,0),true,new Vector2(512,240));
        
        // this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
        // this.halo.render(new Vector2(128,16),new Vector2(0,0));

        this.setBuffer();

        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.backBuffer.render();
        //this.gl.blendFunc(this.gl.DST_COLOR, this.gl.ZERO);
        // this.lightBuffer.render();
        

    }

}
