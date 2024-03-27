
var audioCtx;
var osc;
var timings;
var liveCodeState = [];
const playButton = document.querySelector('button');

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)
    osc = audioCtx.createOscillator();
    timings = audioCtx.createGain();
    timings.gain.value = 0;
    osc.connect(timings).connect(audioCtx.destination);
    osc.start();
    scheduleAudio();
}

function scheduleAudio() {
    let timeElapsedSecs = 0;
    liveCodeState.forEach(noteData => {
        timings.gain.setTargetAtTime(noteData["gain"], audioCtx.currentTime + timeElapsedSecs, noteData["attack"])
        osc.frequency.setTargetAtTime(noteData["pitch"], audioCtx.currentTime + timeElapsedSecs, 0.01)
        timeElapsedSecs += noteData["length"] / 10.0;
        timings.gain.setTargetAtTime(0, audioCtx.currentTime + timeElapsedSecs, noteData["release"])
        timeElapsedSecs += 0.2; //rest between notes
    });
    setTimeout(scheduleAudio, timeElapsedSecs * 1000);
}

function parseCode(code) {
    //how could we allow for a repeat operation 
    //(e.g. "3@340 2[1@220 2@330]"" plays as "3@340 1@220 2@330 1@220 2@330")
    //how could we allow for two lines that play at the same time?
    //what if we want variables?
    //how does this parsing technique limit us?

    let notes = code.split(" ");

    //notice this will fail if the input is not correct
    //how could you handle this? allow some flexibility in the grammar? fail gracefully?
    //ideally (probably), the music does not stop
    notes = notes.map(note => {
        ADSR = note.split(",").slice(1);
        noteData = note.split(',')[0].split("@");
        gain = noteData.length > 2 ? eval(noteData[2]) : 1;
        attack = ADSR.length > 0 ? eval(ADSR[0]) : 0.01;
        release = ADSR.length > 0 ? eval(ADSR[1]) : 0.01;
        console.log(ADSR, gain, attack, release);
        return {
            "length": eval(noteData[0]), //the 'eval' function allows us to write js code in our live coding language
            "pitch": eval(noteData[1]),
            "gain": gain,
            "attack": attack,
            "release": release
        };
        //what other things should be controlled? osc type? synthesis technique?
    });
    console.log(notes);
    return notes;
}

function genAudio(data) {
    liveCodeState = data;
}

function reevaluate() {
    var code = document.getElementById('code').value;
    var data = parseCode(code);
    genAudio(data);
}

playButton.addEventListener('click', function () {

    if (!audioCtx) {
        initAudio();
    }

    reevaluate();


});
