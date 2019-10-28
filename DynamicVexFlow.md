# Quick Start Guide for setting up Flexible Uses of VexFlow

## Install dependencies:
```
$ npm install vexflow
```

## HTML script requirement:
Be sure to include this script in the html or layout.hbs file or the VexFlow render will not work.
```html
<script src="https://unpkg.com/vexflow/releases/vexflow-debug.js"></script>
```
## Begin by using EasyScore
In HTML File: This places where the staff will go
```html
<div class="music-render" id="new-song" >
</div>
```
In CSS File: This sets the staff size that will render on the page
```
.music-render {
       margin: 10px auto;
       padding: 10px;
       background-color: rgba(255, 255, 255, 0.85);
       width: 600px;
       height: 150px;
   }
```
In JavaScript File: This will establish the requisite variables needed to create a new staff
```javascript
let vf = new Vex.Flow.Factory({
    renderer: {elementId: 'new-song'}
});
let score = vf.EasyScore();
let system = vf.System();
```

## JavaScript for adding a single note on a staff

In order to get the program to display single notes in standard notation, you have to program the precise time
 signature or you will get an error of 'not enough notes to render' OR 
'too many backticks' meaning too many beats to render. To get around that, use a simple if/else statement to set the
 time signature according to the rhythm entered by the user as follows:
```javascript
function writeNote(pitch, rhythm){
    document.getElementById('score');
// add additional if statements to include more rhythmic options
    if (rhythm === '/8') {
        score.set({time: "1/8"})
    } else if (rhythm === '/q') {
        score.set({time: "1/4"});
    } else if (rhythm === '/h') {
        score.set({time: "1/2"});
    }
    system.addStave({
        voices: [score.voice(score.notes(pitch + rhythm))]
    }).addClef('treble');

    vf.draw();
}
```
Call this function with a input/button to add and display single notes on a staff. (Values inside the function were
 hardcoded for the purpose of this example.)
```html
<input class="button" type="submit" id="score" onclick="writeNote('C4', '/h')"
       value="Make this note">
```
Please visit the first version of my dynamic use of this library on Heroku [drawMusic v.1](https://draw-music-app.herokuapp.com/) and feel free to submit comments or improvements via an issue in the [DrawMusic GitHub](https://github.com/spianoDev/drawMusic) Repo.
