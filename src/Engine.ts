/**
 * The idea is to have have to modes:
 * ==>Software renderer-built-in es 'mysterious' inner workings
 * ==>Hardware renderer-webgl
 */
//@ts-check
export abstract class Engine {
  public canvas: HTMLCanvasElement;
  public errormsg: string = "Cannot get 2d context from canvas";
  //webgl
  public gl: WebGL2RenderingContext;

  //TODO: later implement a program to read shader files
  public vertexShader: WebGLShader;
  public fragmentShader: WebGLShader;
  public shaderProgram: WebGLProgram;
  public vertsh: string;
  public fragsh: string;
  public sp: Sprite;
  public sp1: Sprite;

  public halo: Sprite;
  public white: Sprite;

  public lightBuffer:BackBuffer;
  public worldSpace:Matrix;
  public spvec:Vector2;
  public sppos:Vector2;

  public sp1vec:Vector2;
  public sp1pos:Vector2;
  public backBuffer:BackBuffer;
  public input:Input;


  constructor(cnvs: HTMLCanvasElement) {
    this.canvas = cnvs;
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.worldSpace = new Matrix();
    this.gl = this.canvas.getContext("webgl2");
    this.input = new Input();
  }

  public setBuffer(buffer?:BackBuffer){
    if(buffer instanceof BackBuffer){
      this.gl.viewport(0, 0, buffer.vect.getX(), buffer.vect.getY());
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,buffer.frame_buf);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }else{
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);
    }
  }

  abstract update():void;
  abstract renderer():void;

  //software rendering?
  public sftdraw() {
    let ctx: CanvasRenderingContext2D;
    try {
      ctx = this.canvas.getContext("2d");
    } catch (e) {
      this.errormsg = "Exception thrown: " + e.toString();
    }
    if (!ctx) {
      alert(this.errormsg);
      throw new Error(this.errormsg);
    }
    ctx.fillStyle = "#f0f0f0";
    ctx.beginPath();
    ctx.moveTo(250, 40);
    ctx.lineTo(450, 250);
    ctx.lineTo(50, 250);
    ctx.closePath();
    ctx.fill();
  }

  //
  /**
   * @info Webgl-threejs
   * Remember order:
   * -init scene or canvas
   * -init the objects
   * -render or draw the objects on the canvas
   */

   public getMatrix():Matrix{
     return this.worldSpace;
   }

  private rend(): void {
    this.gl.clearColor(0.4,0.6,1.0,1.0);
   
    this.update();
    this.input.update();
    this.renderer();
    this.gl.flush();
  }
  public wgl(): void {
    /**
     * Remember order:
     * -update
     * -render
     * -loop
     */
    this.rend();
    requestAnimationFrame(this.wgl.bind(this));
   
   
  }

  public resizeScreen(width:number,height:number):void{
    this.canvas.width = width;
    this.canvas.height = height;
    let ratio:number = width /(height/240);
    this.worldSpace.translate(-1,1);
    this.worldSpace.scale(2/ratio,-2/240);
   
  }
  
}

export class Sprite {
  private gl: WebGL2RenderingContext;
  public file: string;
  private loaded: boolean = false;
  private material: Material;
  private image: any;
  
  //@cleanup
  private aPositionLoc: any;
  private aTexcoordLoc: any;
  private uImageLoc: any;
  private tex_buffer: any;
  private geo_buffer: any;
  private uworldLoc: any;
  private uframeLoc:any;
  private uObjectLoc:any;
  private mat:Matrix;
  private vec:Vector2;

  private uv_x:number;
  private uv_y:number;

  private rend:Renderer;

  constructor(gl: WebGL2RenderingContext, file: string, vs: string, fs: string,mat3:Matrix,adjsize?:boolean,vec2?:Vector2) {
    this.gl = gl;
    this.material = new Material(gl, vs, fs);
    this.mat = mat3;
    this.vec = new Vector2(64,64);
    this.rend = new Renderer(this.gl);
    if(adjsize == true){
      this.vec.setXY(vec2.getX()*1,vec2.getY()*1);
    }
    this.image = new Image();
    this.image.src = file;
    this.image.Sprite = this;
    this.image.onload = function () {
      this.Sprite.setup();
    };
  }

  public setup(): void {
  
    this.gl.useProgram(this.material.getProgram());

    
    //textures=>converting image to gl_image
    // this.texture = this.gl.createTexture();
    // this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);


    //this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    /**material.set("type", object);
     * texParams = {
     *  type: 2D
     *   pname:{T?:bool,S?:bool,mag?:bool,min?:bool}
     *   int:
     *  }
     * }
     */
    // this.gl.texParameteri(
    //   this.gl.TEXTURE_2D,
    //   this.gl.TEXTURE_WRAP_S,
    //   this.gl.MIRRORED_REPEAT
    // );
    // this.gl.texParameteri(
    //   this.gl.TEXTURE_2D,
    //   this.gl.TEXTURE_WRAP_T,
    //   this.gl.MIRRORED_REPEAT
    // );
    // this.gl.texParameteri(
    //   this.gl.TEXTURE_2D,
    //   this.gl.TEXTURE_MAG_FILTER,
    //   this.gl.NEAREST
    // );
    // this.gl.texParameteri(
    //   this.gl.TEXTURE_2D,
    //   this.gl.TEXTURE_MIN_FILTER,
    //   this.gl.NEAREST
    // );

    // this.material.set("texParams",{type:this.gl.TEXTURE_2D,secParam:this.gl.TEXTURE_WRAP_S,thirdParam:this.gl.MIRRORED_REPEAT});
    // this.material.set("texParams",{type:this.gl.TEXTURE_2D,secParam:this.gl.TEXTURE_WRAP_T,thirdParam:this.gl.MIRRORED_REPEAT});
    // this.material.set("texParams",{type:this.gl.TEXTURE_2D,secParam:this.gl.TEXTURE_MAG_FILTER,thirdParam:this.gl.NEAREST});
    // this.material.set("texParams",{type:this.gl.TEXTURE_2D,secParam:this.gl.TEXTURE_MIN_FILTER,thirdParam:this.gl.NEAREST});
    this.uv_x = this.vec.getX() / this.image.width;
    this.uv_y = this.vec.getY() / this.image.height;
    
    this.tex_buffer = this.rend.setupSprite("2D",Util.createArray(0,0,this.uv_x,this.uv_y),Util.createArray(0,0,this.vec.getX(),this.vec.getY()));
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.image
    );
    this.gl.bindTexture(this.gl.TEXTURE_2D,null);


    //read shader information
    this.aPositionLoc = this.gl.getAttribLocation(
      this.material.getProgram(),
      "a_position"
    );
    this.aTexcoordLoc = this.gl.getAttribLocation(
      this.material.getProgram(),
      "a_texCoord"
    );
    this.uImageLoc = this.gl.getUniformLocation(
      this.material.getProgram(),
      "u_image"
    );


    this.uworldLoc = this.gl.getUniformLocation(
      this.material.getProgram(),
      "u_world"
    );
    this.uObjectLoc = this.gl.getUniformLocation(this.material.getProgram(),"u_object");
    this.uframeLoc = this.gl.getUniformLocation(
      this.material.getProgram(),
      "u_frame"
    );


    this.gl.useProgram(null);
    this.loaded = true;
  }

  //@clean
  public render(pos:Vector2,frames:Vector2,scale?:boolean,scalevals?:Vector2): void {
    if (this.loaded) {
      let frameX:number = Math.floor(frames.getX()) * this.uv_x;
      let frameY:number = Math.floor(frames.getY()) * this.uv_y;

      let moveMat:Matrix = new Matrix();
      this.gl.useProgram(this.material.getProgram());

      moveMat.translate(pos.getX(),pos.getY());
      this.gl.uniform4f(this.gl.getUniformLocation(this.material.getProgram(),"u_color"),1,1,1,1);

      if(scale == true){
        this.gl.uniform4f(this.gl.getUniformLocation(this.material.getProgram(),"u_color"),0.125,0.125,0.25,1);
        moveMat.scale(scalevals.getX(),scalevals.getY()); 
      }

     
      this.gl.activeTexture(this.gl.TEXTURE0);
     this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex_buffer.texturedat);
      // this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

      this.gl.uniform1i(this.uImageLoc, 0);

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tex_buffer.texBuffer);
      // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tex_buffer);

      //this.gl.uniform1i(this.uImageLoc, 0);
      this.gl.enableVertexAttribArray(this.aTexcoordLoc);
      this.gl.vertexAttribPointer(
        this.aTexcoordLoc,
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      );

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tex_buffer.geoBuf);
      // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geo_buffer);

      this.gl.enableVertexAttribArray(this.aPositionLoc);
      this.gl.vertexAttribPointer(
        this.aPositionLoc,
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      );

      this.gl.uniform2f(this.uframeLoc,frameX, frameY);
      this.gl.uniformMatrix3fv(this.uworldLoc,false,this.mat.getFloatArray());
      this.gl.uniformMatrix3fv(this.uObjectLoc,false,moveMat.getFloatArray());
     

      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 6);

      this.gl.useProgram(null);
    }
  }
}

export class Material {
  private gl: WebGL2RenderingContext;
  public vs: string;
  public fs: string;
  private program: WebGLProgram;
  constructor(gl: WebGL2RenderingContext, vs: string, fs: string) {
    this.gl = gl;
    this.vs = vs;
    this.fs = fs;

    let vsShader: WebGLShader = this.makeShader(vs, this.gl.VERTEX_SHADER);
    let fsShader: WebGLShader = this.makeShader(fs, this.gl.FRAGMENT_SHADER);

    if (vsShader && fsShader) {
      this.program = this.createProgram(this.gl,vsShader,fsShader);
    }
  }
  private makeShader(vs: string, type: any): WebGLShader {
    let sh = this.gl.createShader(type);
    this.gl.shaderSource(sh, vs);
    this.gl.compileShader(sh);

    if (!this.gl.getShaderParameter(sh, this.gl.COMPILE_STATUS)) {
      console.error("Shader error: " + this.gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }
  //boilerplate
  private createProgram(gl:WebGL2RenderingContext,vs:WebGLShader,fs:WebGLShader):WebGLProgram{
    let program = gl.createProgram();

    //shaders
    gl.attachShader(program,vs);
    gl.attachShader(program,fs);    
    //link
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
        console.error("Program failed to link shaders: " + gl.getProgramInfoLog(program));
    }
    return program;
  }
  public getProgram(): WebGLProgram {
    return this.program;
  }
  public set(typeParams:string, objInfo:{type:number,secParam:number,thirdParam:number}):void{
    switch(typeParams){
      case "texParams":{
        this.gl.texParameteri(objInfo.type,objInfo.secParam,objInfo.thirdParam);
        break;
      }
      default:
        console.error("Error setting parameters!!");
        break;
    }
  }
}

export class Matrix{
  private mat3:number[][];
  //creates identity matrix
  constructor(){
    this.mat3 = 
    [
      [1,0,0],
      [0,1,0],
      [0,0,1]
    ];
  }
  /**
   * translate given vector positions x and y
   * |1 0 0|
   * |0 1 0|
   * |x y 1|
   */
  public translate(x:number, y:number):void{
    this.mat3[2][0] = x;
    this.mat3[2][1] = y;
  }
  /**
   * scale given vector positions x and y
   * |x 0 0|
   * |0 y 1|
   * |0 0 1|
   */
  public scale(x:number, y:number):void{
    this.mat3[0][0] = x;
    this.mat3[1][1] = y;
  }

  public mul(m:Matrix):Matrix{
    let mat:Matrix = new Matrix();
    let i:number;
    let j:number;
    for(i = 0; i < 3; i++){
      for(j = 0; j < 3; j++){
        mat.mat3[i][j] = this.mat3[i][0] * m.mat3[0][j]+
                         this.mat3[i][1] * m.mat3[1][j]+
                         this.mat3[i][2] * m.mat3[2][j];
      }
    }

    return mat;
  }
  public getFloatArray():Float32Array{
   
    return new Float32Array(
      [ this.mat3[0][0], this.mat3[0][1], this.mat3[0][2],
        this.mat3[1][0], this.mat3[1][1], this.mat3[1][2],
        this.mat3[2][0], this.mat3[2][1], this.mat3[2][2]
      ]
    );
  }
}
export class Vector2{
  public x:number;
  public y:number;
  constructor(x?:number,y?:number){
    this.x = x;
    this.y = y;
  }
  public getX():number{
    return this.x;
  }
  public getY():number{
    return this.y;
  }
  public setXY(nx:number,ny:number):void{
    this.x = nx;
    this.y = ny;
  }
  public setX(nx:number):void{
    this.x = nx;
  }
  public setY(ny:number):void{
    this.y = ny;
  }
}
export class BackBuffer{
  public vect:Vector2;
  private gl:WebGL2RenderingContext;
  private material:Material;
  public frame_buf:any;
  private render_buf:any;
  private texture:WebGLTexture;
  private tex_buf:any;
  private geo_buf:any;

  constructor(gl:WebGL2RenderingContext,adjsize?:boolean,vec?:Vector2){
    this.gl = gl;
    this.material = new Material(this.gl,Util.backBufvs,Util.backBuffs);

    this.vect = new Vector2(512,512);

    if(adjsize == true){
      this.vect.setXY(vec.getX(),vec.getY());
    }
    this.frame_buf = this.gl.createFramebuffer();
    this.render_buf = this.gl.createRenderbuffer();
    this.texture = this.gl.createTexture();

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,this.frame_buf);
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,this.render_buf);
    this.gl.bindTexture(this.gl.TEXTURE_2D,this.texture);

    this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE);

    this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.NEAREST);

    this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.vect.getX(),this.vect.getY(),0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,null);

    this.gl.renderbufferStorage(this.gl.RENDERBUFFER,this.gl.DEPTH_COMPONENT16,this.vect.getX(),this.vect.getY());
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,this.gl.COLOR_ATTACHMENT0,this.gl.TEXTURE_2D,this.texture,0);
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER,this.gl.DEPTH_ATTACHMENT,this.gl.RENDERBUFFER,this.render_buf);

    //create shapes or geometry
    this.tex_buf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tex_buf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER,Util.createArray(),this.gl.STATIC_DRAW);
  
    this.geo_buf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.geo_buf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER,Util.createArray(-1,-1,2,2), gl.STATIC_DRAW);

    this.gl.bindTexture(this.gl.TEXTURE_2D,null);
    this.gl.bindTexture(this.gl.RENDERBUFFER,null);
    this.gl.bindTexture(this.gl.FRAMEBUFFER,null);



  }
  public render(){
    this.gl.useProgram(this.material.getProgram());

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D,this.texture);
   // this.material.set("u_image",0);
    this.gl.uniform1i( this.gl.getUniformLocation(
      this.material.getProgram(),
      "u_image"
    ), 0);


    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.tex_buf);
    //this.material.set("a_texCoord");//@clean
    this.gl.enableVertexAttribArray(this.gl.getAttribLocation(
      this.material.getProgram(),
      "a_texCoord"
    ));
      this.gl.vertexAttribPointer(
        this.gl.getAttribLocation(
          this.material.getProgram(),
          "a_texCoord"
        ),
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      );
    //@clean
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.geo_buf);
    this.gl.enableVertexAttribArray(this.gl.getAttribLocation(
      this.material.getProgram(),
      "a_position"
    ));
      this.gl.vertexAttribPointer(
        this.gl.getAttribLocation(
          this.material.getProgram(),
          "a_position"
        ),
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      );

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,6);

    this.gl.useProgram(null); 
  }
 
}

class Util{
  static backBufvs:string = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;

    varying vec2 v_texCoord;
    void main(){
        gl_Position = vec4(a_position,1,1);
        v_texCoord = a_texCoord;
    }
  
  `;

  static backBuffs:string = `
    precision mediump float;
    uniform sampler2D u_image;
    varying vec2 v_texCoord;
    void main(){
        gl_FragColor = texture2D(u_image, v_texCoord);
    }
  
  `;
  static createArray(
    x: number = 0,
    y: number = 0,
    w: number = 1,
    h: number = 1
  ): Float32Array {
    return new Float32Array([
      x,
      y,
      x + w,
      y,
      x,
      y + h,
      x,
      y + h,
      x + w,
      y,
      x + w,
      y + h,
    ]);
  }
}
export class Input {

  //possibly optimize it using hashmaps?
  public currentKeys:boolean[] = [];
  public lastKeys:boolean[] = [];


  constructor() {
      document.addEventListener('keydown', this.keyboardDown);
      document.addEventListener('keyup', this.keyboardUp);
  }
  public update(){
    let i:number = 0;
    for(i; i < 256; i++){
      this.lastKeys[i] = this.currentKeys[i];
      this.lastKeys[i] = false;
    }
    
  }

  public isKeyDown(key:number):boolean{
    return this.currentKeys[key] && !this.lastKeys[key];
  }
  public isKeyUp(key:number){
    return this.lastKeys[key] && !this.currentKeys[key];
  }

  public keyboardDown = (event: KeyboardEvent): void => {
      this.currentKeys[event.keyCode] = true;
     
  }

  public keyboardUp = (event: KeyboardEvent): void => {
      this.currentKeys[event.keyCode] = false;
  }

}

export class Renderer{
  private gl:WebGL2RenderingContext;
  constructor(gl:WebGL2RenderingContext){
    this.gl = gl;
  }
  public setupSprite(type:string,textureData:Float32Array,geometryData:Float32Array,options?:{}):any{
    let texture = this.gl.createTexture();
    switch(type){
      case "2D":{
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        //@sprite-info:setup sprite information
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_WRAP_S,
          this.gl.MIRRORED_REPEAT
        );
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_WRAP_T,
          this.gl.MIRRORED_REPEAT
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_MAG_FILTER,
            this.gl.NEAREST
        );
        this.gl.texParameteri(
            this.gl.TEXTURE_2D,
            this.gl.TEXTURE_MIN_FILTER,
            this.gl.NEAREST
        );
        //texture data
          let tex_buffer = this.gl.createBuffer();
          this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tex_buffer);
          this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            textureData,
            this.gl.STATIC_DRAW
          );

        //geometry data
          let geo_buffer = this.gl.createBuffer();
          this.gl.bindBuffer(this.gl.ARRAY_BUFFER, geo_buffer);
          this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            geometryData,
            this.gl.STATIC_DRAW
          );
         
        return {
            texBuffer:tex_buffer,
            geoBuf: geo_buffer,
            texturedat:texture
        };
      }
      default:
        return;
    }
  }
}