// start a serial for the Arduino
let port;
// add in button variable to connect/disconnect Arduino
let connectBtn;
// variable to send a command to the Arduino
let sendBtn;
// declare variables for the current temperature and light received through Arduino
let currentLight = 0;
let currentTemp = 0;

// variable for updating background only when button is pressed
let updateBackground = false;

function setup() {
  // set up the canvas size for the computer size
  // add a background color of a light gray
  createCanvas(windowWidth, windowHeight);
  background(220);

  // start the serial connection
  port = createSerial();

  // open ports that have been used previously 
  // if the port is more than 0, use a baud rate of 57600
  let usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    port.open(usedPorts[0], 9600);
  }

  // start a button that connects to the Arduino
  connectBtn = createButton("Connect to Arduino");
  // place the button a little lower than middle of the screen 
  connectBtn.position(windowWidth * 0.5, windowHeight * 0.75);
  // when the button has a mouse pressing it, a click function is triggered
  connectBtn.mousePressed(connectBtnClick);

  // add a new button that allows the user to check the room
  sendBtn = createButton("Check Room");
  // put button in the middle
  sendBtn.position(windowWidth * 0.5, windowHeight * 0.5);
  // when the button has a mouse pressing it, a click function is triggered
  sendBtn.mousePressed(sendBtnClick);

  // add in text settings
  textFont("system-ui", 50);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
}

function draw() {
  // this makes received text scroll up
  // copy(0, 0, windowWidth, windowHeight, 0, -1, windowWidth, windowHeight);

  // reads in complete lines and prints them at the bottom of the canvas
  let str = port.readUntil("\n");
  if (str.length < 0) {
    return;
  }

  // if updatebackground is changed to true, change the background with this code
  if (updateBackground) {
    // formats data string based on where the comma lies (inserted in Arduino)
    let datain = str.trim().split(",");

    // reading array and splitting into temp and light numbers
    // round in case the numbers are not integers
    // no need to map these as we already mapped them to color hues in the Arduino code
    const temp = round(Number(datain[0]));
    const light = round(Number(datain[1]));

    // define a list of RGB hues
    let backgroundColor = [];

    // I want the light color to be different intensities of yellow based on the brightness
    // I want when the temp is lower than half, the color that shows up is an intensity of blue
    // and when it's hot I want the color to be red
    if (temp < 127) {
      // if temp is low the color is blue, the cooler, the more blue it gets
      // must map since its out of 0 - 127 and I want it back to color hue of 0-255
      let colortemp = round(map(255 - temp, 127, 255, 0, 255));
      // mix yellow color (brightness) with the blue color for temperature
      backgroundColor = [light, light, colortemp];
    } else {
      // map the temperature to the color hue for red, higher numbers
      let tempred = round(map(temp, 127, 255, 0, 255));
      // add the two red colors together 
      let tempredplusyellow = tempred + light;
      // re-map the colors back to color hue of 0-255
      let mappedtemp = round(map(tempredplusyellow, 0, 510, 0, 255));
      // create the high temp background color
      backgroundColor = [mappedtemp, light, 0];
    }

    // reset the background to intergers
    background(round(backgroundColor[0]), round(backgroundColor[1]), round(backgroundColor[2]));
    // print the backgroundColor on the page
    // text color
    fill(255);   
    // text size
    textSize(32);
    // text displayed a little higher than the middle of the screen
    text(`${backgroundColor[0]}, ${backgroundColor[1]}, ${backgroundColor[2]}`, windowWidth * 0.5, windowHeight * 0.25);
    // set background to not update until button is pressed again
    updateBackground = false;
  }

  // changes button label based on connection status
  if (!port.opened()) {
    connectBtn.html("Connect to Arduino");
    // turn background back to gray
    background(220);
  } else {
    connectBtn.html("Disconnect");
    // read from port until new line
    let str = port.readUntil("\n")
  }
}

// connect the Arduino function
function connectBtnClick() {
  if (!port.opened()) {
    port.open("Arduino", 9600);
  } else {
    port.close();
  }
}

function sendBtnClick() {
  // tell the user that Check Button was registered and is sent to the Arduino
  port.write("LED ON\n");
  console.log("sending command to Arduino")
  // set the background based on data
  updateBackground = true;
}
