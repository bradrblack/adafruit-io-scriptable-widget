// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: magic;

// Sample Scriptable Widget to Display AdafruitIO Feed Data on an iOS home
// screen or lock screen widget.  In this example a temperature value is 
// displayed along with a message about how "fresh" the data is relative to 
// the current time.
//
// Brad Black - 2023
//

// Substitute your Adafruit IO credentials and feed name here..

const AdafruitIOUser = "myAIOusername";
const AIOKEY = "myAIOKey";
const AIOFeedName = "feedname";

const widget = new ListWidget();

widget.backgroundColor = Color.black();

var problem = false;

// Construct our AIO API request

const req = new Request("https://io.adafruit.com/api/v2/" + AdafruitIOUser + "/feeds/" + AIOFeedName + "/data/last");
req.headers = { "X-AIO-Key": AIOKEY };
try {
  console.log("start");
  var res = await req.loadJSON();
} catch (err) {
  console.log(err);
  problem = true;
}

if (!problem) {
  console.log(res.value);
  let temp = res.value;

  let createdAt = res.created_at;
  console.log(createdAt);

// Calculate the time difference between the feed value and current time

  var delayMessage = "";
  var Date2 = new Date();
  var Date1 = new Date(createdAt);
  var timeDiff = Math.abs(Date2.getTime() - Date1.getTime());
  var timeDiffInSecond = Math.ceil(timeDiff / 1000);
  console.log(timeDiffInSecond);

  if (timeDiffInSecond < 60) { delayMessage = "Just a moment ago"; } else {
    if (timeDiffInSecond < 120) { delayMessage = "About a minute ago"; } else
      if (timeDiffInSecond < 1200) { delayMessage = "About " + (timeDiffInSecond / 60).toFixed() + " minutes ago"; }
  }
  if (timeDiffInSecond >= 1200) delayMessage = "Problem Getting Data";

  console.log(delayMessage);

  let text = widget.addText(Number(temp).toFixed(1) + "°C");
  text.font = Font.systemFont(32);
  text.textColor = Color.yellow();
  text.centerAlignText();

  let timeText = widget.addText(delayMessage);
  timeText.font = Font.systemFont(10);
  timeText.textColor = Color.white();
  timeText.centerAlignText();
  timeText.bottomAlignContent;


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
widget.presentMedium();
