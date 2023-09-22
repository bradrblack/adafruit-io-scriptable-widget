// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;

// Sample Scriptable Widget to Display AdafruitIO Feed Data on an iOS home
// screen or lock screen widget.  In this example a battery voltage value is 
// displayed inside a round guage that shows the battery "level"
//
// Brad Black - 2023
//
// progressCircle() function from https://gist.github.com/Normal-Tangerine8609
//

// Substitute your Adafruit IO credentials and feed name here..

const AdafruitIOUser = "myAIOusername";
const AIOKEY = "myAIOKey";
const AIOFeedNameVolts = "voltage-feedname";
const widget = new ListWidget();

widget.backgroundColor = Color.black();

var problem = false;

// Construct our AIO API request

const reqV = new Request("https://io.adafruit.com/api/v2/" + AdafruitIOUser + "/feeds/" + AIOFeedNameVolts + "/data/last");
reqV.headers = { "X-AIO-Key": AIOKEY };
try {
  console.log("start");
  var resV = await reqV.loadJSON();// 
} catch (err) {
  console.log(err);
  problem = true;
}


if (!problem) {
  console.log(resV.value);
  let voltage = resV.value;

  console.log("voltage scaled: ");
  console.log(convertRange(voltage, [3.2, 4.2], [0, 100]));
  let progressStack = await progressCircle(widget, convertRange(voltage, [3.2, 4.2], [0, 100]));

  var t = progressStack.addText(Number(voltage).toFixed(1) + " V");

  t.font = Font.systemFont(14);
  t.textColor = Color.green();
  t.centerAlignText();

} else {

  let text = widget.addText("Offline?");
  text.font = Font.systemFont(22);
  text.textColor = Color.yellow();
  text.centerAlignText();

}
// Attempt to refresh the widget every 10 minutes...


const now = Date.now();
widget.refreshAfterDate = new Date(now + (30 * 60 * 1000));
console.log(widget.refreshAfterDate);

Script.setWidget(widget);
Script.complete();
widget.presentSmall();

function convertRange(value, r1, r2) {
  return ((value - r1[0]) * (r2[1] - r2[0])) / (((r1[1] - r1[0]) + r2[0]));
}

async function progressCircle(
  on,
  value = 50,
  colour = "hsl(0, 0%, 100%)",
  background = "hsl(0, 0%, 10%)",
  size = 56,
  barWidth = 5.5
) {
  if (value > 1) {
    value /= 100
  }
  if (value < 0) {
    value = 0
  }
  if (value > 1) {
    value = 1
  }

  async function isUsingDarkAppearance() {
    return !Color.dynamic(Color.white(), Color.black()).red
  }
  let isDark = await isUsingDarkAppearance()

  if (colour.split("-").length > 1) {
    if (isDark) {
      colour = colour.split("-")[1]
    } else {
      colour = colour.split("-")[0]
    }
  }

  if (background.split("-").length > 1) {
    if (isDark) {
      background = background.split("-")[1]
    } else {
      background = background.split("-")[0]
    }
  }

  let w = new WebView()
  await w.loadHTML('<canvas id="c"></canvas>')

  let base64 = await w.evaluateJavaScript(
    `
    let colour = "${colour}",
      background = "${background}",
      size = ${size}*3,
      lineWidth = ${barWidth}*3,
      percent = ${value * 100}
        
    let canvas = document.getElementById('c'),
      c = canvas.getContext('2d')
    canvas.width = size
    canvas.height = size
    let posX = canvas.width / 2,
      posY = canvas.height / 2,
      onePercent = 360 / 100,
      result = onePercent * percent
    c.lineCap = 'round'
    c.beginPath()
    c.arc( posX, posY, (size-lineWidth-1)/2, (Math.PI/180) * 270, (Math.PI/180) * (270 + 360) )
    c.strokeStyle = background
    c.lineWidth = lineWidth 
    c.stroke()
    c.beginPath()
    c.strokeStyle = colour
    c.lineWidth = lineWidth
    c.arc( posX, posY, (size-lineWidth-1)/2, (Math.PI/180) * 270, (Math.PI/180) * (270 + result) )
    c.stroke()
    completion(canvas.toDataURL().replace("data:image/png;base64,",""))`,
    true
  )
  const image = Image.fromData(Data.fromBase64String(base64))

  let stack = on.addStack()
  stack.size = new Size(size, size)
  stack.backgroundImage = image
  stack.centerAlignContent()
  let padding = barWidth * 2
  stack.setPadding(padding, padding, padding, padding)

  return stack
}
