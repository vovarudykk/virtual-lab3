let gl;        
let iAttribVertex;        
let iAttribTexture;           
let iColor;                    
let iColorCoef;            
let iModelViewProjectionMatrix; 
let iTextureMappingUnit;
let iVertexBuffer;        
let iTexBuffer;               
let spaceball;
let wireframe = false;
let eye_separation = 0.35;

let m;
let p;
let scale;
let step;
let a_;
let b_;
let g_;
let rand_clr = [];

let u_range = [-Math.PI/2, Math.PI/2];
let v_range = [-Math.PI/2, Math.PI/2];



function x0(v){
    let c = 1;
    return c*Math.cos(v)*Math.cos(v)*Math.cos(v);
}   


function y0(v){
    let c = 1;
    return c*Math.sin(v)*Math.sin(v)*Math.sin(v);
}


function astroidalHelicoid(u, v) {
    let a = 0.5;
    let b = 1;
    
    let t = Math.PI/4;

    let v0 = v * Math.PI * 2;
    let u0 = u * Math.PI;

    let x = (a + x0(v0)*Math.cos(t) + y0(v0)*Math.sin(t))*Math.cos(u0);
    let y = (a + x0(v0)*Math.cos(t) + y0(v0)*Math.sin(t))*Math.sin(u0);
    let z = b*u0 - x0(v0)*Math.sin(t) + y0(v0)*Math.cos(t);

    return [x, y, z];
}

function applyScale(elem, index, arr){
    arr[index] = elem * scale;
}


// class StereoCamera {
//     constructor(Convergence,
//         EyeSeparation,
//         AspectRatio,
//         FOV,
//         NearClippingDistance,
//         FarClippingDistance) {

//         this.mConvergence = Convergence;
//         this.mEyeSeparation = EyeSeparation;
//         this.mAspectRatio = AspectRatio;
//         this.mFOV = FOV * Math.PI / 180.0;
//         this.mNearClippingDistance = NearClippingDistance;
//         this.mFarClippingDistance = FarClippingDistance;

//         this.ApplyLeftFrustum = function () {

//             let top, bottom, left, right;

//             top = this.mNearClippingDistance * Math.tan(this.mFOV / 2.0);
//             bottom = -top;

//             let a = this.mAspectRatio * Math.tan(this.mFOV / 2.0) * this.mConvergence;

//             let b = a - this.mEyeSeparation / 2.0;
//             let c = a + this.mEyeSeparation / 2.0;

//             left = -b * this.mNearClippingDistance / this.mConvergence;
//             right = c * this.mNearClippingDistance / this.mConvergence;

//             let frustum = m4.frustum(left, right, bottom, top, this.mNearClippingDistance, this.mFarClippingDistance);
//             let trans = m4.translation(this.mEyeSeparation / 2.0, 0.0, 0.0);

//             return m4.multiply(frustum, trans);
//         };

//         this.ApplyRightFrustum = function () {

//             let top, bottom, left, right;

//             top = this.mNearClippingDistance * Math.tan(this.mFOV / 2.0);
//             bottom = -top;

//             let a = this.mAspectRatio * Math.tan(this.mFOV / 2.0) * this.mConvergence;

//             let b = a - this.mEyeSeparation / 2.0;
//             let c = a + this.mEyeSeparation / 2.0;

//             left = -c * this.mNearClippingDistance / this.mConvergence;
//             right = b * this.mNearClippingDistance / this.mConvergence;

//             let frustum = m4.frustum(left, right, bottom, top, this.mNearClippingDistance, this.mFarClippingDistance);
//             let trans = m4.translation(-this.mEyeSeparation / 2.0, 0.0, 0.0);

//             return m4.multiply(frustum, trans);
//         };
//     }
// };


function drawPrimitive(primitiveType, color, vertices, texCoords) {
    gl.uniform4fv(iColor, color);
    gl.uniform1f(iColorCoef, 0.0);

    gl.enableVertexAttribArray(iAttribVertex);
    gl.bindBuffer(gl.ARRAY_BUFFER, iVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);
    gl.vertexAttribPointer(iAttribVertex, 3, gl.FLOAT, false, 0, 0);

    if (texCoords) {
        gl.enableVertexAttribArray(iAttribTexture);
        gl.bindBuffer(gl.ARRAY_BUFFER, iTexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STREAM_DRAW);
        gl.vertexAttribPointer(iAttribTexture, 2, gl.FLOAT, false, 0, 0);
    }
    else {
        gl.disableVertexAttribArray(iAttribTexture);
        gl.vertexAttrib2f(iAttribTexture, 0.0, 0.0);
        gl.uniform1f(iColorCoef, 1.0);
    }

    gl.drawArrays(primitiveType, 0, vertices.length / 3);
}


function draw() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let projection = m4.perspective(Math.PI/8, 1, 8, 12); 

    let modelView = spaceball.getViewMatrix();

    // let rotateToPointZero = m4.axisRotation([0.707, 0.707, 0], 0.7);
    let translateToPointZero = m4.translation(0, 0, -10);

    // let matAccum0 = m4.multiply(rotateToPointZero, modelView);
    let matAccum0 = m4.multiply(getRotationMatrix(a_, b_, g_), modelView );
    let matAccum1 = m4.multiply(translateToPointZero, matAccum0);

    // var cam = new StereoCamera(
    //     12.0,
    //     eye_separation,
    //     1.333333,
    //     45.0,
    //     5.0,
    //     35.0);

    let modelViewProjection = m4.multiply(projection, matAccum1);
    gl.uniformMatrix4fv(iModelViewProjectionMatrix, false, modelViewProjection);
    gl.uniform1i(iTextureMappingUnit, 0);
    // gl.colorMask(true, false, false, false);

    let start = -Math.PI/2
    let end = Math.PI/2

    if (wireframe) {
        for (let i = start; i <= end; i += 0.1) {
            for (let j = start; j <=end; j += 0.1) {
                drawPrimitive(gl.LINE_STRIP, 
                    [1, 100, 0, 1], 
                    [...astroidalHelicoid(i, j),
                    ...astroidalHelicoid(i + 0.1, j),
                    ...astroidalHelicoid(i + 0.1, j + 0.1)]);
            }
        }
    } else {
        for (let i = start; i <= end; i += 0.1) {
            for (let j =start; j <= end; j += 0.1) {
                drawPrimitive(gl.LINE_STRIP, 
                    [1, 100, 0, 1], 
                    [...astroidalHelicoid(i, j), 
                    ...astroidalHelicoid(i + 0.1, j), 
                    ...astroidalHelicoid(i + 0.1, j + 0.1)]);
            }
        }
        for (let i = start; i <= end; i += 0.1) {
            for (let j = start ; j <=end; j += 0.1) {
                drawPrimitive(gl.TRIANGLE_FAN, 
                    [1, 100, 1, 1], 
                    [...astroidalHelicoid(i, j), 
                    ...astroidalHelicoid(i + 0.1, j), 
                    ...astroidalHelicoid(i + 0.1, j + 0.1), 
                    ...astroidalHelicoid(i, j + 0.1)]);
            }
        }
    }

    // gl.clear(gl.DEPTH_BUFFER_BIT);

    // let rightMatrix = m4.multiply(cam.ApplyRightFrustum(), matAccum1);
    // gl.uniformMatrix4fv(iModelViewProjectionMatrix, false, rightMatrix);
    // gl.uniform1i(iTextureMappingUnit, 0);
    // gl.colorMask(false, true, true, false);

    // if (wireframe) {
    //     for (let i = start; i <= end; i += 0.1) {
    //         for (let j = start; j <=end; j += 0.1) {
    //             drawPrimitive(gl.LINE_STRIP, 
    //                 [1, 100, 0, 1], 
    //                 [...astroidalHelicoid(i, j),
    //                 ...astroidalHelicoid(i + 0.1, j),
    //                 ...astroidalHelicoid(i + 0.1, j + 0.1)]);
    //         }
    //     }
    // } else {
    //     for (let i = start; i <= end; i += 0.1) {
    //         for (let j =start; j <= end; j += 0.1) {
    //             drawPrimitive(gl.LINE_STRIP, 
    //                 [1, 100, 0, 1], 
    //                 [...astroidalHelicoid(i, j), 
    //                 ...astroidalHelicoid(i + 0.1, j), 
    //                 ...astroidalHelicoid(i + 0.1, j + 0.1)]);
    //         }
    //     }
    //     for (let i = start; i <= end; i += 0.1) {
    //         for (let j = start ; j <=end; j += 0.1) {
    //             drawPrimitive(gl.TRIANGLE_FAN, 
    //                 [1, 100, 1, 1], 
    //                 [...astroidalHelicoid(i, j), 
    //                 ...astroidalHelicoid(i + 0.1, j), 
    //                 ...astroidalHelicoid(i + 0.1, j + 0.1), 
    //                 ...astroidalHelicoid(i, j + 0.1)]);
    //         }
    //     }
    // }

    // gl.lineWidth(1);
    // drawPrimitive(gl.LINES, [1, 0, 0, 1], [-2, 0, 0, 2, 0, 0]);
    // drawPrimitive(gl.LINES, [0, 1, 0, 1], [0, -2, 0, 0, 2, 0]);
    // drawPrimitive(gl.LINES, [0, 0, 1, 1], [0, 0, -2, 0, 0, 2]);
    // gl.lineWidth(1);
}


function wireFrameCheckbox(event) {
    wireframe = event.target.checked;
    draw();
}

function onMChanged(event){
    m = event.target.value;
    calculateScale();
    draw();
}

function onPChanged(event){
    p = event.target.value;
    calculateScale();
    draw();
}

function onMaxUChanged(event){
    u_range[1] = event.target.value * Math.PI;
    calculateScale();
    draw();
}

function onMaxVChanged(event){
    v_range[1] = event.target.value * Math.PI;
    calculateScale();
    draw();
}

function eyeSeperationBox(event) {
    eye_separation = event.target.value;
    draw();
}

function handleOrientation(event){
    a_ = event.alpha;
    b_ = event.beta;
    g_ = event.gamma;
    draw();
}

var degtorad = Math.PI / 180; // Degree-to-Radian conversion

function getRotationMatrix( alpha, beta, gamma ) {

    var _x = beta  ? beta  * degtorad : 0; // beta value
    var _y = gamma ? gamma * degtorad : 0; // gamma value
    var _z = alpha ? alpha * degtorad : 0; // alpha value

    var cX = Math.cos( _x );
    var cY = Math.cos( _y );
    var cZ = Math.cos( _z );
    var sX = Math.sin( _x );
    var sY = Math.sin( _y );
    var sZ = Math.sin( _z );

    var m11 = cZ * cY - sZ * sX * sY;
    var m12 = - cX * sZ;
    var m13 = cY * sZ * sX + cZ * sY;

    var m21 = cY * sZ + cZ * sX * sY;
    var m22 = cZ * cX;
    var m23 = sZ * sY - cZ * cY * sX;

    var m31 = - cX * sY;
    var m32 = sX;
    var m33 = cX * cY;

    return [
        m11,    m12,    m13, 0,
        m21,    m22,    m23, 0,
        m31,    m32,    m33, 0,
        0,      0,      0,   1
    ];

};

function initGL() {
    let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(prog);

    iAttribVertex = gl.getAttribLocation(prog, "vertex");
    iAttribTexture = gl.getAttribLocation(prog, "texCoord");

    iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
    iColor = gl.getUniformLocation(prog, "color");
    iColorCoef = gl.getUniformLocation(prog, "fColorCoef");
    iTextureMappingUnit = gl.getUniformLocation(prog, "u_texture");

    iVertexBuffer = gl.createBuffer();
    iTexBuffer = gl.createBuffer();

    // LoadTexture();

    gl.enable(gl.DEPTH_TEST);
}


// function LoadTexture() {
//     var texture = gl.createTexture();
//     gl.bindTexture(gl.TEXTURE_2D, texture);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

//     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

//     var image = new Image();
//     image.crossOrigin = 'anonymous';
//     image.src = "https://webglfundamentals.org/webgl/resources/f-texture.png";
//     image.addEventListener('load', () => {
//         gl.bindTexture(gl.TEXTURE_2D, texture);
//         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
//         draw();
//     });
// }


function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vShader);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
    }
    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fShader);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
    }
    let prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
    }
    return prog;
}

function calculateScale(){
    var max_screen_val = 2.0;
    var max_func_val = 0.0;
    for(var u_i = u_range[0]; u_i <= u_range[1]; u_i += step){
        rand_clr[u_i] = [];
        for(var v_i = v_range[0]; v_i <= v_range[1]; v_i += step){
            rand_clr[u_i][v_i] = [Math.random(), Math.random(), Math.random(), 1.0];
            var res_arr = astroidalHelicoid(u_i, v_i);
            var max = Math.max.apply(null, res_arr);
            var min_abs = Math.min.apply(null, res_arr);
            min_abs = Math.abs(min_abs);
            if(max > max_func_val) max_func_val = max;
            if(min_abs > max_func_val) max_func_val = min_abs;
        }
    }
    scale = max_screen_val / max_func_val;
}


function init() {

    step = 0.7;
    p = 0.1;
    m = 0.1;

    calculateScale();


    document.getElementById("wireframe").addEventListener("change", wireFrameCheckbox);
    document.getElementById("eye_separation").addEventListener("change", eyeSeperationBox);

    let canvas;
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        if ( ! gl ) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();  // initialize the WebGL graphics context
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        return;
    }

    spaceball = new TrackballRotator(canvas, draw, 0);

    draw();
}