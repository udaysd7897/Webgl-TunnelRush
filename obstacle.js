

function initObs(gl,z) {

  if(z%2 <= 0.1){
    y =-1
  }
  else
    y= 1

  const positionBuffer = gl.createBuffer();
  z=z*-60;
  
  r=Math.floor(Math.random() * 20)
  z=z-r*2;
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  obpos.push(z);
  const positions = [
    0, 5, z,
    0,-5, z,
    4*y, 5, z,
    4*y,-5, z,

  ];


  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  const textureCoordinates = [
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);


  const indices = [
    0,  1,  2,      1,  2,  3,    // front
  ];


  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };

}

function initObs2(gl,z) {
    if(z%2 <= 0.1){
      y =-1
    }
    else
      y= 1
    const positionBuffer = gl.createBuffer();
    z=z*-60;
    r=Math.floor(Math.random() * 20)
    z=z-r*2;

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    obpos2.push(z);
    const positions = [
      0, 5, z,
      0,-5, z,
      4*y, 5, z,
      4*y,-5, z,
  
    ];
  
  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
  
    const faceColors = [
      [1.0,  0.0,  0.0,  1.0],    // Front face: white
    ];
  
  
    var colors = [];
  
    for (var j = 0; j < faceColors.length; ++j) {
     const c = faceColors[j];
  
       colors = colors.concat(c, c, c, c);
    }
  
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  
  
    const indices = [
      0,  1,  2,      1,  2,  3,    // front
    ];
  
  
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);
  
    return {
      position: positionBuffer,
      color: colorBuffer,
      indices: indexBuffer,
    };
  }


function drawObs2(gl, programInfo, buffers, deltaTime,ind) {

  var projectionMatrix2 = mat4.create();
  
  var modelViewMatrix2 = mat4.create();
  
  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  var y=0;
  if(ind % 2 <=0.1){
    y =-1
  }
  else
    y= 1

  mat4.perspective(projectionMatrix2,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

 
  mat4.translate(modelViewMatrix2,     // destination matrix
                 modelViewMatrix2,     // matrix to translate
                 [-0.0, 1.0, -pos]);
  if(ind >5){       // axis to rotate around (Z)
  mat4.rotate(modelViewMatrix2,  // destination matrix
              modelViewMatrix2,  // matrix to rotate
              cubeRotation*-0.4 + rot*y,// amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (X)
  }
  else{
    mat4.rotate(modelViewMatrix2,  // destination matrix
      modelViewMatrix2,  // matrix to rotate
      cubeRotation,     // amount to rotate in radians
      [0, 0, 1]);
  }
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
  // {
  //   const numComponents = 2; // every coordinate composed of 2 values
  //   const type = gl.FLOAT; // the data in the buffer is 32 bit float
  //   const normalize = false; // don't normalize
  //   const stride = 0; // how many bytes to get from one set to the next
  //   const offset = 0; // how many bytes inside the buffer to start from
  //   gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
  //   gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, numComponents, type, normalize, stride, offset);
  //   gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
  // }
 
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

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix2);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix2);

 {
    const vertexCount = 6;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

}

function drawObs(gl, programInfo, buffers, texture,deltaTime ,ind) {
  
    var projectionMatrix2 = mat4.create();
    
    var modelViewMatrix2 = mat4.create();
    
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    var y=0;
    if(ind % 2 <=0.1){
      y =-1
    }
    else
      y= 1
  
    mat4.perspective(projectionMatrix2,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);
  
   
    mat4.translate(modelViewMatrix2,     // destination matrix
                   modelViewMatrix2,     // matrix to translate
                   [-0.0, 1.0, -pos]);
                // amount to translate
    if(ind >5){       // axis to rotate around (Z)
    mat4.rotate(modelViewMatrix2,  // destination matrix
                modelViewMatrix2,  // matrix to rotate
                cubeRotation*-0.4 + rot*y,// amount to rotate in radians
                [0, 0, 1]);       // axis to rotate around (X)
    }
    else{
      mat4.rotate(modelViewMatrix2,  // destination matrix
        modelViewMatrix2,  // matrix to rotate
        cubeRotation,     // amount to rotate in radians
        [0, 0, 1]);
    }
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
  
    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  
    // Tell WebGL to use our program when drawing
  
    gl.useProgram(programInfo.program);
  
    // Set the shader uniforms
  
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix2);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix2);
  
    gl.activeTexture(gl.TEXTURE0);
        
          // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);
        
          // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
   {
      const vertexCount = 6;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  
    // Update the rotation for the next draw
  }