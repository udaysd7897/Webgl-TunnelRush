var cubeRotation = 0.0;
var rot = 0.0;
var pos=2;

var ind=0;
var ind2=0;

var obpos=[];
var obpos2=[];

var angle1,clock,anti;
var flag=1;
var jf=0;
var ypos=1.5;
var speed=.1;

main();

function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');


  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }
 //if(flag==1){
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;

      // Apply lighting effect

      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
  `;
//}
//else{
  const vsSource2 = `
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexColor;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying lowp vec4 vColor;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
  }
`;
//}
//if(flag==1){
  const fsSource = `
  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  uniform sampler2D uSampler;

  void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
  }
`;
//}
//else{
  const fsSource2 = `
  varying lowp vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
  }
`;
//}
 const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
 const shaderProgram2 = initShaderProgram(gl, vsSource2, fsSource2);
//if(flag==1){
   const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };
//}
//else
//{
  const programInfo2 = {
    program: shaderProgram2,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram2, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram2, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram2, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram2, 'uModelViewMatrix'),
    },
  };
//}
  var Key = {
    _pressed: {},
  
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    
    isDown: function(keyCode) {
      return this._pressed[keyCode];
    },
    
    onKeydown: function(event) {
      this._pressed[event.keyCode] = true;
    },
    
    onKeyup: function(event) {
      delete this._pressed[event.keyCode];
    }
  };
  window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
  window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);
  var add=0.0001;
  var curr=0;
  var next=-80;
  var f=0;

  buffers=[];
  buffers2=[];

  obstacles=[];
  obstacles2=[];

  var step=.05;
  for(var i=0;i<40;i=i+1){
    buffers.push(initBuffers(gl,-2*i));
    buffers2.push(initBuffers2(gl,-2*i));
  }
  for(var i=0;i<20;i=i+1){
    obstacles.push(initObs(gl,i));
    obstacles2.push(initObs2(gl,i));
  }
 
  var then = 0;
 // if(flag==1){
    const texture = loadTexture(gl, 'wall.jpeg');
    const textureObs = loadTexture(gl, 'obs1.jpg');
  //}
  document.addEventListener('keydown', function(event) {
    if(event.keyCode == 32) {        
        flag*=-1;
    }
    if(event.keyCode == 38) if(jf==0){
    jf=1;
    }
  });  
  
  function render(now) {
	  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
	  gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    document.getElementById("score").innerHTML = "SCORE:" + Math.floor(-pos); 
    angle1=(cubeRotation*180/Math.PI)%360;
    clock=((cubeRotation*-0.4+rot)*180/Math.PI)%360;
    anti=((cubeRotation*-0.4-rot)*180/Math.PI)%360;
    //console.log(clock,anti);
    if (Key.isDown(Key.LEFT)) cubeRotation+=0.05;     
    if (Key.isDown(Key.RIGHT)) cubeRotation-=0.05;

    if(obpos[ind]>pos-.8)
      {
        if(ind<=5)
        {
        if((ind%2) ==0)
          if(angle1<190 && angle1>-10  ||(angle1<-170 && angle1>-360))
          if(flag==1)
          {
            add=0;
            step=0;
            alert('collision')
          }

        
        if((ind%2) ==1)
          if((angle1<360 && angle1>170) || ( angle1<2 && angle1>-190) )
          if(flag==1)
          {
            add=0;
            step=0;
            alert('collision')
          }

        }
        else{
          if((ind%2) ==0)
            if(anti<190 && anti>-10  ||(anti<-170 && anti>-360))
            if(flag==1)
            {
              add=0;
              step=0;
              alert('collision')
            }

        
          if((ind%2) ==1)
            if((clock<360 && clock>170) || ( clock<2 && clock>-190) )
            if(flag==1)
            {
              add=0;
              step=0;
              alert('collision')
            }


        }
        ind++;
      }

    if(obpos2[ind2]>pos-.8)
      {
        if(ind2<=5)
        {
        if((ind2%2) ==0)
          if(angle1<190 && angle1>-10  ||(angle1<-170 && angle1>-360))
          if(flag==-1)
          {
            add=0;
            step=0;
            alert('collision')
          } 
        
        if((ind2%2) ==1)
          if((angle1<360 && angle1>170) || ( angle1<2 && angle1>-190) )
          if(flag==-1)
          {
            add=0;
            step=0;
            alert('collision')
          }
        }
        else{
          if((ind2%2) ==0)
            if(anti<190 && anti>-10  ||(anti<-170 && anti>-360))
            if(flag==-1)
            {
              add=0;
              step=0;
              alert('collision')
            }
        
          if((ind2%2) ==1)
            if((clock<360 && clock>170) || ( clock<2 && clock>-190) )
            if(flag==-1)
            {
              add=0;
              step=0;
              alert('collision')
            }

        }
        ind2++;
      }
    if(jf==1) jump(jf);
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
    for(var i=0;i<40;i=i+1)
      if(flag==1)
        drawScene(gl, programInfo, buffers[i], texture, deltaTime);
      else  drawScene2(gl, programInfo2, buffers2[i], deltaTime);
    for(var i=0;i<20;i=i+1)
      if(flag==1)
        drawObs(gl, programInfo, obstacles[i], textureObs,deltaTime,i);
      else drawObs2(gl, programInfo2, obstacles2[i] ,deltaTime,i);
       
        
    requestAnimationFrame(render);
    pos-=step;
    step+=add;
    rot+=.08;
    if(Math.ceil(pos)==f){
    	buffers[curr]=initBuffers(gl,next)
    	buffers2[curr]=initBuffers2(gl,next)
	    curr++;
	    curr=curr%40;
	    next-=2;
	    f-=2;
	  }
  }
  requestAnimationFrame(render);
}

function jump(){
 ypos-=speed;
 speed-=.01;
 if(ypos>1)
 {
   speed=.1;
   jf=0;
   ypos=1;
 }
}
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function initBuffers(gl,z) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.
  r=3;
  const positions = [
  	r*(Math.cos(Math.PI/8)), r*(Math.sin(Math.PI/8)), z - 2,
    r*(Math.cos(3*Math.PI/8)), r*(Math.sin(3*Math.PI/8)), z - 2,
	  r*(Math.cos(Math.PI/8)), r*(Math.sin(Math.PI/8)), z,
    r*(Math.cos(3*Math.PI/8)), r*(Math.sin(3*Math.PI/8)), z,
    
    r*(Math.cos(3*Math.PI/8)), r*(Math.sin(3*Math.PI/8)), z - 2,
    r*(Math.cos(5*Math.PI/8)), r*(Math.sin(5*Math.PI/8)), z - 2,
    r*(Math.cos(3*Math.PI/8)), r*(Math.sin(3*Math.PI/8)), z,
    r*(Math.cos(5*Math.PI/8)), r*(Math.sin(5*Math.PI/8)), z,

    r*(Math.cos(5*Math.PI/8)), r*(Math.sin(5*Math.PI/8)), z - 2,
    r*(Math.cos(7*Math.PI/8)), r*(Math.sin(7*Math.PI/8)), z - 2,
    r*(Math.cos(5*Math.PI/8)), r*(Math.sin(5*Math.PI/8)), z,
    r*(Math.cos(7*Math.PI/8)), r*(Math.sin(7*Math.PI/8)), z,

    r*(Math.cos(7*Math.PI/8)), r*(Math.sin(7*Math.PI/8)), z - 2,
    r*(Math.cos(9*Math.PI/8)), r*(Math.sin(9*Math.PI/8)), z - 2,
    r*(Math.cos(7*Math.PI/8)), r*(Math.sin(7*Math.PI/8)), z,
    r*(Math.cos(9*Math.PI/8)), r*(Math.sin(9*Math.PI/8)), z,

    r*(Math.cos(11*Math.PI/8)), r*(Math.sin(11*Math.PI/8)), z - 2,
    r*(Math.cos(9*Math.PI/8)), r*(Math.sin(9*Math.PI/8)), z - 2,
    r*(Math.cos(11*Math.PI/8)), r*(Math.sin(11*Math.PI/8)), z,
    r*(Math.cos(9*Math.PI/8)), r*(Math.sin(9*Math.PI/8)), z,

    r*(Math.cos(13*Math.PI/8)), r*(Math.sin(13*Math.PI/8)), z - 2,
    r*(Math.cos(11*Math.PI/8)), r*(Math.sin(11*Math.PI/8)), z - 2,
    r*(Math.cos(11*Math.PI/8)), r*(Math.sin(11*Math.PI/8)), z,
    r*(Math.cos(13*Math.PI/8)), r*(Math.sin(13*Math.PI/8)), z,

    r*(Math.cos(15*Math.PI/8)), r*(Math.sin(15*Math.PI/8)), z - 2,
    r*(Math.cos(13*Math.PI/8)), r*(Math.sin(13*Math.PI/8)), z - 2,
    r*(Math.cos(13*Math.PI/8)), r*(Math.sin(13*Math.PI/8)), z,
    r*(Math.cos(15*Math.PI/8)), r*(Math.sin(15*Math.PI/8)), z,

    r*(Math.cos(15*Math.PI/8)), r*(Math.sin(15*Math.PI/8)), z - 2,
    r*(Math.cos(Math.PI/8)), r*(Math.sin(Math.PI/8)), z - 2,
    r*(Math.cos(Math.PI/8)), r*(Math.sin(Math.PI/8)), z,
    r*(Math.cos(15*Math.PI/8)), r*(Math.sin(15*Math.PI/8)), z,

  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
 
  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  const textureCoordinates = [
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Back
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Top
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Bottom
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Right
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Left
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
  
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
  
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

 const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  
  n=Math.sqrt(.5);
  const vertexNormals = [
    n,  n,  0.0,
    n,  n,  0.0,
    n,  n,  0.0,
    n,  n,  0.0,

     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    -n,  n,  0.0,
    -n,  n,  0.0,
    -n,  n,  0.0,
    -n,  n,  0.0,
 
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,

     -n, -n,  0.0,
     -n, -n,  0.0,
     -n, -n,  0.0,
     -n, -n,  0.0,
  
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     // Right

     n, -n,  0.0,
     n, -n,  0.0,
     n, -n,  0.0,
     n, -n,  0.0,
      // Left
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,
 
    ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
                gl.STATIC_DRAW);

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.


  // Now set up the colors for the faces. We'll use solid colors
  // for each face.

  const myColors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.2,  0.2,  1.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.5,  1.0],    // Top face: green
    [1.0,  0.2,  0.4,  1.0],    // Left face: purple
    [1.0,  0.8,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
    [0.5,  0.5,  0.5,  1.0],    // Left face: purple
    [0.0,  0.8,  0.7,  1.0],    // Bottom face: blue
  ];
  var off=-1*z/2;
  var faceColors=[];
  for(var i=0;i<=8;i++)
  	faceColors.push(myColors[(i+off)%8]);

  // Convert the array of colors into a table for all the vertices.

  // var colors = [];

  // for (var j = 0; j < faceColors.length; ++j) {
  //   const c = faceColors[j];

  //   // Repeat each color four times for the four vertices of the face
  //   colors = colors.concat(c, c, c, c);
  // }

  // const colorBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // // Build the element array buffer; this specifies the indices
  // // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,  1,  2,      1,  2,  3,    // front
    4,  5,  6,      5,  6,  7,    // back
    8,  9,  10,     9,  10, 11,   // top
    12, 13, 14,     13, 14, 15,   // bottom
    16, 17, 18,     17, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
    24, 25, 26,     24, 26, 27,   // left
    28, 29, 30,     28, 30, 31,   // left
  ];

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);
  return {
        position: positionBuffer,
        normal: normalBuffer,
        textureCoord: textureCoordBuffer,  
        indices: indexBuffer,
      };
  // return {
  //   position: positionBuffer,
  //   color: colorBuffer,
  //   indices: indexBuffer,
  // };
}
function initBuffers2(gl,z) {
  
  
    const positionBuffer = gl.createBuffer();
  
  
     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    r=3;
    const positions = [
      r*(Math.cos(Math.PI/8)), r*(Math.sin(Math.PI/8)), z - 2,
      r*(Math.cos(3*Math.PI/8)), r*(Math.sin(3*Math.PI/8)), z - 2,
      r*(Math.cos(Math.PI/8)), r*(Math.sin(Math.PI/8)), z,
      r*(Math.cos(3*Math.PI/8)), r*(Math.sin(3*Math.PI/8)), z,
      
      r*(Math.cos(3*Math.PI/8)), r*(Math.sin(3*Math.PI/8)), z - 2,
      r*(Math.cos(5*Math.PI/8)), r*(Math.sin(5*Math.PI/8)), z - 2,
      r*(Math.cos(3*Math.PI/8)), r*(Math.sin(3*Math.PI/8)), z,
      r*(Math.cos(5*Math.PI/8)), r*(Math.sin(5*Math.PI/8)), z,
  
      r*(Math.cos(5*Math.PI/8)), r*(Math.sin(5*Math.PI/8)), z - 2,
      r*(Math.cos(7*Math.PI/8)), r*(Math.sin(7*Math.PI/8)), z - 2,
      r*(Math.cos(5*Math.PI/8)), r*(Math.sin(5*Math.PI/8)), z,
      r*(Math.cos(7*Math.PI/8)), r*(Math.sin(7*Math.PI/8)), z,
  
      r*(Math.cos(7*Math.PI/8)), r*(Math.sin(7*Math.PI/8)), z - 2,
      r*(Math.cos(9*Math.PI/8)), r*(Math.sin(9*Math.PI/8)), z - 2,
      r*(Math.cos(7*Math.PI/8)), r*(Math.sin(7*Math.PI/8)), z,
      r*(Math.cos(9*Math.PI/8)), r*(Math.sin(9*Math.PI/8)), z,
  
      r*(Math.cos(11*Math.PI/8)), r*(Math.sin(11*Math.PI/8)), z - 2,
      r*(Math.cos(9*Math.PI/8)), r*(Math.sin(9*Math.PI/8)), z - 2,
      r*(Math.cos(11*Math.PI/8)), r*(Math.sin(11*Math.PI/8)), z,
      r*(Math.cos(9*Math.PI/8)), r*(Math.sin(9*Math.PI/8)), z,
  
      r*(Math.cos(13*Math.PI/8)), r*(Math.sin(13*Math.PI/8)), z - 2,
      r*(Math.cos(11*Math.PI/8)), r*(Math.sin(11*Math.PI/8)), z - 2,
      r*(Math.cos(11*Math.PI/8)), r*(Math.sin(11*Math.PI/8)), z,
      r*(Math.cos(13*Math.PI/8)), r*(Math.sin(13*Math.PI/8)), z,
  
      r*(Math.cos(15*Math.PI/8)), r*(Math.sin(15*Math.PI/8)), z - 2,
      r*(Math.cos(13*Math.PI/8)), r*(Math.sin(13*Math.PI/8)), z - 2,
      r*(Math.cos(13*Math.PI/8)), r*(Math.sin(13*Math.PI/8)), z,
      r*(Math.cos(15*Math.PI/8)), r*(Math.sin(15*Math.PI/8)), z,
  
      r*(Math.cos(15*Math.PI/8)), r*(Math.sin(15*Math.PI/8)), z - 2,
      r*(Math.cos(Math.PI/8)), r*(Math.sin(Math.PI/8)), z - 2,
      r*(Math.cos(Math.PI/8)), r*(Math.sin(Math.PI/8)), z,
      r*(Math.cos(15*Math.PI/8)), r*(Math.sin(15*Math.PI/8)), z,
  
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
   
    const myColors = [
      [1.0,  1.0,  1.0,  1.0],    // Front face: white
      [0.2,  0.2,  1.0,  1.0],    // Back face: red
      [0.0,  1.0,  0.5,  1.0],    // Top face: green
      [1.0,  0.2,  0.4,  1.0],    // Left face: purple
      [1.0,  0.8,  0.0,  1.0],    // Right face: yellow
      [1.0,  0.0,  1.0,  1.0],    // Left face: purple
      [0.5,  0.5,  0.5,  1.0],    // Left face: purple
      [0.0,  0.8,  0.7,  1.0],    // Bottom face: blue
    ];
    var off=-1*z/2;
    var faceColors=[];
    for(var i=0;i<=8;i++)
      faceColors.push(myColors[(i+off)%8]);
  
    // Convert the array of colors into a table for all the vertices.
  
    var colors = [];
  
    for (var j = 0; j < faceColors.length; ++j) {
      const c = faceColors[j];
  
      // Repeat each color four times for the four vertices of the face
      colors = colors.concat(c, c, c, c);
    }
  
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  
    // // Build the element array buffer; this specifies the indices
    // // into the vertex arrays for each face's vertices.
  
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  
    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.
  
    const indices = [
      0,  1,  2,      1,  2,  3,    // front
      4,  5,  6,      5,  6,  7,    // back
      8,  9,  10,     9,  10, 11,   // top
      12, 13, 14,     13, 14, 15,   // bottom
      16, 17, 18,     17, 18, 19,   // right
      20, 21, 22,     20, 22, 23,   // left
      24, 25, 26,     24, 26, 27,   // left
      28, 29, 30,     28, 30, 31,   // left
    ];
  
    // Now send the element array to GL
  
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);
    // return {
    //       position: positionBuffer,
    //       normal: normalBuffer,
    //       textureCoord: textureCoordBuffer,  
    //       indices: indexBuffer,
    //     };
    return {
      position: positionBuffer,
      color: colorBuffer,
      indices: indexBuffer,
    };
  }
  
function drawScene(gl, programInfo, buffers, texture, deltaTime){
  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, ypos, -pos]);  // amount to translate
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation,     // amount to rotate in radians
              [0, 0, 0]);       // axis to rotate around (Z)
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation ,// amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (X)

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 2; // every coordinate composed of 2 values
    const type = gl.FLOAT; // the data in the buffer is 32 bit float
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set to the next
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
  }
  // {
  //   const numComponents = 4;
  //   const type = gl.FLOAT;
  //   const normalize = false;
  //   const stride = 0;
  //   const offset = 0;
  //   gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  //   gl.vertexAttribPointer(
  //       programInfo.attribLocations.vertexColor,
  //       numComponents,
  //       type,
  //       normalize,
  //       stride,
  //       offset);
  //   gl.enableVertexAttribArray(
  //       programInfo.attribLocations.vertexColor);
  // }

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
   

     programInfo.attribLocations.vertexNormal);
  }
  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);


  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
  gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix);  
  gl.activeTexture(gl.TEXTURE0);
      
        // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);
      
        // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
      
      
  {
    const vertexCount = 48;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Update the rotation for the next draw
}

function drawScene2(gl, programInfo, buffers, deltaTime) {

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  const modelViewMatrix = mat4.create();


  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, ypos, -pos]);  // amount to translate
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation,     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation * .7,// amount to rotate in radians
              [0, 0, 0]);       // axis to rotate around (X)

  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);


  gl.useProgram(programInfo.program);


  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  {
    const vertexCount = 48;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
}

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

