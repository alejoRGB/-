let canvas;

//-------------------PARTE DE OSC
var socket;
var isConnected;


//-----------PARTE DE P5JS

let sketch = function(p){

    let ver_valores;
    let ver_lineas;
    let ver_corazon;
    let ver_fps;
    let var_drawHands;

    let font;
    //coordinadas que guardan la ubicacion de los dedos indices
    let coordx_indice_A=0;
    let coordy_indice_A=0;
    let coordx_indice_B=0;
    let coordy_indice_B=0;

    //coordinadas que guardan la ubicacion de los dedos indices
    let coordx_medio_A =0;
    let coordy_medio_A =0;
    let coordx_medio_B =0;
    let coordy_medio_B =0;

    //coordinadas que guardan la ubicacion de los dedos anulares
    let coordx_anular_A =0;
    let coordy_anular_A =0;
    let coordx_anular_B =0;
    let coordy_anular_B =0;

    //coordinadas que guardan la ubicacion de los dedos anulares
    let coordx_meñique_A =0;
    let coordy_meñique_A =0;
    let coordx_meñique_B =0;
    let coordy_meñique_B =0;

    
    //coordinadas que guardan la ubicacion de los dedos anulares
    let coordx_pulgar_A =0;
    let coordy_pulgar_A =0;
    let coordx_pulgar_B =0;
    let coordy_pulgar_B =0;
   
    let promedio_distancias;

    //FUNCION PRELOAD carga los archivos antes de que cargue la pagina
    p.preload = function() {
        // Carga la fuente TrueType
        font = p.loadFont('Inconsolata_Regular.ttf');
        //SETEA EL PUERTO DE ENTRADA Y DE SALIDA DE OSC
        setupOsc(8000, 12000);     
      }
      
    p.setup = function(){
        canvas= p.createCanvas(640,480,p.WEBGL);
        canvas.id("canvas");
        ver_valores = false;
        ver_lineas = true;
        ver_corazon = true;
        ver_fps = false;
        var_drawHands = false;
   
    }

    p.draw = function(){
        p.clear();
        p.translate(-p.width/2, -p.height/2);

        //funcion para ver los fps
        if(ver_fps == true){
            p.drawFPS();
        }

        //funcion que calcula distancias entre las puntas de los dedos y 
        //las envía por OSC

        p.calcularDistancias();

        //función que dibuja las lineas entre las puntas de los dedos
        if (ver_lineas){
            p.lineasEntreManos();
        }
        
        //multihandLandmaks detecta las manos si no es undefined
        if(detections != undefined){
            if(detections.multiHandLandmarks != undefined){
            
                p.drawHands();
                
                
                //para mantener positivo asi el corazon siempre se dibuja para arriba
                let px;
                let py;
                let size;

                px =-p.width/2 +coordx_indice_A + (((coordx_indice_B-coordx_indice_A)/2));
                py = -p.height/2 +((coordy_indice_A+coordy_indice_B)/2);
                size = (coordx_indice_B-coordx_indice_A)/2;

                
                if(size <0){
                    size = -size;
                }
                if(ver_corazon){
                    p.drawHearts(px,py,size);
                }
                
            }
        }
    }

//--------------------------------------------------------------------------------------
//--------Definición de funciones

//FUNCION QUE DETECTA LAS TECLAS PRESIONADAS

p.keyTyped = function() {
    // Tu lógica de keyPressed aquí
    if (p.keyCode == 65){
        //tecla A
        ver_valores = !ver_valores;
        
    }
    if (p.keyCode == 83){
        //tecla S
        ver_lineas = !ver_lineas;
    }
    if (p.keyCode == 68){
        //tecla D
        ver_corazon = !ver_corazon;
    }
    if (p.keyCode == 70){
        //tecla F
        ver_fps = !ver_fps;
    }
    if(p.keyCode == 71){
        //tecla G
        var_drawHands = !var_drawHands;
    }


  };

//FUNCION QUE DIBUJA LOS FPS
    p.drawFPS = function(){
        p.stroke(20);
        p.textFont(font);
        p.textSize(65);
        p.fill(0,0,0);
        //p.translate(-p.width/2, -p.height/2);
        p.text(Math.floor(p.frameRate()), 30,50);
        
    } 
//FUNCION QUE DIBUJA LOS PUNTOS EN LAS MANOS
    p.drawHands = function(){
        
        p.stroke(0);
        p.strokeWeight(10);
        //p.translate(-p.width/2, -p.height/2);
        

        for(let i = 0;i < detections.multiHandLandmarks.length; i++){
            for(let j = 0;j < detections.multiHandLandmarks[i].length; j++){
                
                let x = detections.multiHandLandmarks[i][j].x * p.width;
                let y = detections.multiHandLandmarks[i][j].y * p.height;
                let z = detections.multiHandLandmarks[i][j].z;
                if(var_drawHands){
                    p.point(x,y,z);
                }
                //

                //chequear segun  los valores del array las posiciones de los dedos

                //dedos indices
                if(i == 0 && j == 8){
                    coordx_indice_A = x;
                    coordy_indice_A = y;
                }
                if(i == 1 && j == 8){
                    coordx_indice_B = x;
                    coordy_indice_B = y;
                }       

                //dedo medio
                if(i == 0 && j == 12){
                    coordx_medio_A = x;
                    coordy_medio_A = y;
                }
                if(i == 1 && j == 12){
                    coordx_medio_B = x;
                    coordy_medio_B = y;
                } 

                //dedos anulares
                if(i == 0 && j == 16){
                    coordx_anular_A = x;
                    coordy_anular_A = y;
                }
                if(i == 1 && j == 16){
                    coordx_anular_B = x;
                    coordy_anular_B = y;
                }  
                
                //dedos meñiques
                if(i == 0 && j == 20){
                    coordx_meñique_A = x;
                    coordy_meñique_A = y;
                }
                if(i == 1 && j == 20){
                    coordx_meñique_B = x;
                    coordy_meñique_B = y;
                }  

                //dedos meñiques
                if(i == 0 && j == 4){
                    coordx_pulgar_A = x;
                    coordy_pulgar_A = y;
                }
                if(i == 1 && j == 4){
                    coordx_pulgar_B = x;
                    coordy_pulgar_B = y;
                }
            }
        }
        }
//FUNCION QUE DIBUJA UN CORAZON EN LA POSICIÓN Y ESCALA QUE SE LE PASAN COMO PARAMETROS

    p.drawHearts = function(posx, posy, radio){
                //Así se tiene que llamar para dibujar un corazon entre los 2 dedos indices
                //p.drawHearts(-p.width/2 +coord1 + (((coord3-coord1)/2)),-p.height/2 +coord2,(coord3-coord1)/2);

                
                //p.translate(p.width/2+posx, p.height/2+posy);
                p.noFill();
                p.stroke(255,0,0); 
                p.strokeWeight(4);
                p.beginShape();
                for(let i =0; i <p.TWO_PI;i+=0.01){

                    let r = p.map(radio,0,500,0,30);
                    let x = r * 16 * p.pow(p.sin(i), 3) + p.width/2+posx;
                    let y = -r * (13 * p.cos(i) - 5*p.cos(2*i) - 2*p.cos(3*i)- p.cos(4*i)) + p.height/2+posy;

                    p.vertex(x,y);
                    //console.log(r);
                }
                p.endShape();
                
    }
//FUNCION QUE DIBUJA las lineas entre los puntos de cada mano
    p.drawLines = function(index){
        //console.log(index);
        p.stroke(255);
        p.strokeWeight(3);
        //p.translate(-p.wieght/4, -p.height/4);

        
        
        for(let i = 0;i < detections.multiHandLandmarks.length; i++){

            for(let j = 0;j < index.length-1; j++){
                
                let x = detections.multiHandLandmarks[i][index[j]].x * p.width;
                let y = detections.multiHandLandmarks[i][index[j]].y * p.height;
                let z = detections.multiHandLandmarks[i][index[j]].z;

                let _x = detections.multiHandLandmarks[i][index[j+1]].x * p.width;
                let _y = detections.multiHandLandmarks[i][index[j+1]].y * p.height;
                let _z = detections.multiHandLandmarks[i][index[j+1]].z;
                //p.line(x,y,z,_x,_y,_z);
                            
            }

            
        }
        
    }
//FUNCION QUE CALCULA LAS DISTANCIAS ENTRE LAS PUNTAS DE LOS DEDOS Y LAS ENVIA POR OSC
    p.calcularDistancias = function(){

            

        //calculo de distancias
        let distancia_dedos_indices =  p.dist(coordx_indice_A,coordy_indice_A,coordx_indice_B,coordy_indice_B);
        let distancia_dedos_medio =    p.dist(coordx_medio_A,coordy_medio_A,coordx_medio_B,coordy_medio_B);
        let distancia_dedos_anulares = p.dist(coordx_anular_A,coordy_anular_A,coordx_anular_B,coordy_anular_B);
        let distancia_dedos_meñiques = p.dist(coordx_meñique_A,coordy_meñique_A,coordx_meñique_B,coordy_meñique_B);
        let distancia_dedos_pulgares = p.dist(coordx_pulgar_A,coordy_pulgar_A,coordx_pulgar_B,coordy_pulgar_B);

        //enviar la distancia
        sendOsc('/promedio_dedos_indices',promedio_distancias/5);
        sendOsc('/promedio_dedos_medio',promedio_distancias/5);
        sendOsc('/promedio_dedos_anulares',promedio_distancias/5);
        sendOsc('/promedio_dedos_meñiques',promedio_distancias/5);
        sendOsc('/promedio_dedos_pulgares',promedio_distancias/5);
        
        //calculo promedio de distancias
        promedio_distancias =   distancia_dedos_indices +
                                distancia_dedos_medio   +
                                distancia_dedos_anulares +
                                distancia_dedos_meñiques +
                                distancia_dedos_pulgares;

        //dibujar lineas entre las puntas de los dedos


        //console.log(promedio_distancias/5);

        //sendOsc('/promedio',promedio_distancias/5);
        //mostrar el numero de distancia
        p.stroke(10);
        p.textFont(font);
        p.textSize(36);
        p.fill(255);
        //p.translate(-p.width/2, -p.height/2);

        //imprimir los valores si la tecla A es presionada
        if(ver_valores){
            p.text(Math.floor(distancia_dedos_indices),
               (coordx_indice_A + coordx_indice_B)/2, 
               (coordy_indice_A + coordy_indice_B)/2);
        
            p.text(Math.floor(distancia_dedos_medio),
                (coordx_medio_A + coordx_medio_B)/2, 
                (coordy_medio_A + coordy_medio_B)/2);

            p.text(Math.floor(distancia_dedos_anulares),
            (coordx_anular_A + coordx_anular_B)/2, 
            (coordy_anular_A + coordy_anular_B)/2);

            p.text(Math.floor(distancia_dedos_meñiques),
            (coordx_meñique_A +coordx_meñique_B)/2, 
            (coordy_meñique_A + coordy_meñique_B)/2);

            p.text(Math.floor(distancia_dedos_pulgares),
            (coordx_pulgar_A + coordx_pulgar_B)/2, 
            (coordy_pulgar_A + coordy_pulgar_B)/2);
        }
        
        
        }

    p.lineasEntreManos = function(){
        p.stroke(255);
        p.strokeWeight(3);
        p.line(coordx_indice_A,coordy_indice_A,coordx_indice_B,coordy_indice_B);
        p.line(coordx_medio_A,coordy_medio_A,coordx_medio_B,coordy_medio_B);
        p.line(coordx_anular_A,coordy_anular_A,coordx_anular_B,coordy_anular_B);
        p.line(coordx_meñique_A,coordy_meñique_A,coordx_meñique_B,coordy_meñique_B);
        p.line(coordx_pulgar_A,coordy_pulgar_A,coordx_pulgar_B,coordy_pulgar_B);
    }
    }
//-----------funciones que setean la comunicación OSC
//--------------------------------------------------
    function sendOsc(address, value) {
        if (isConnected) {
            socket.emit('message', [address, value]);
        }
    }



    function setupOsc(oscPortIn, oscPortOut) {
        socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
        socket.on('connect', function() {
            socket.emit('config', {
                server: { port: oscPortIn,  host: '127.0.0.1'},
                client: { port: oscPortOut, host: '127.0.0.1'}
            });
        });
        socket.on('connect', function() {
            isConnected = true;
        });
        socket.on('message', function(msg) {
            if (msg[0] == '#bundle') {
                for (var i=2; i<msg.length; i++) {
                    receiveOsc(msg[i][0], msg[i].splice(1));
                }
            } else {
                receiveOsc(msg[0], msg.splice(1));
            }
        });
    }


let myp5 = new p5(sketch);