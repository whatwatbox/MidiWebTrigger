class LaunchpadMiniMK3 extends MidiDevice {
    constructor(midiInput, midiOutput, onMidiInput) {
        super("Launchpad Mini MK3", midiInput, midiOutput, onMidiInput);
    }

    //ボタンの状態を変更する
    setButtonState(pattern, note, color) {
        const patternValue = this.getPatternValue(pattern);
        const colorIndex = this.getNearColorIndex(color);
        const sendData = [patternValue, note, colorIndex];

        this.midiOutput.send(sendData);
    }

    //midiメッセージを受け取ったときの処理
    onMidiMessage (event){
        //MidiMessageを取得する
        const midiMessage = event.data;
        //MidiMessageのnoteを取得する
        const note = midiMessage[1];
        //Channelを取得する
        const channel = midiMessage[0] & 0x0F;
        //NoteOnかNoteOffかを取得する
        const isNoteOn = midiMessage[0] === 144;

        //NoteOnの場合は呼び出す
        if(isNoteOn)
        {
            //親クラスのonMidiInputがundefinedでない場合は呼び出す
            if(this.onMidiInput != null)
                this.onMidiInput(channel, note);
        }
    }

    displayPattern = {
        select: 0x91,
        on: 0x90,
        off: 0x90
    }

    colorList = [
        "#000000",
        "#1E1E1E",
        "#7F7F7F",
        "#FFFFFF",
        "#FF4C4C",
        "#FF0000",
        "#590000",
        "#190000",
        "#FFBD6C",
        "#FF5400",
        "#591D00",
        "#271B00",
        "#FFFF4C",
        "#FFFF00",
        "#595900",
        "#191900",
        "#88FF4C",
        "#54FF00",
        "#1D5900",
        "#142B00",
        "#4CFF4C",
        "#00FF00",
        "#005900",
        "#001900",
        "#4CFF5E",
        "#00FF19",
        "#00590D",
        "#001902",
        "#4CFF88",
        "#00FF55",
        "#00591D",
        "#001F12",
        "#4CFFB7",
        "#00FF99",
        "#005935",
        "#001912",
        "#4CC3FF",
        "#00A9FF",
        "#004152",
        "#001019",
        "#4C88FF",
        "#0055FF",
        "#001D59",
        "#000819",
        "#4C4CFF",
        "#0000FF",
        "#000059",
        "#000019",
        "#874CFF",
        "#5400FF",
        "#190064",
        "#0F0030",
        "#FF4CFF",
        "#FF00FF",
        "#590059",
        "#190019",
        "#FF4C87",
        "#FF0054",
        "#59001D",
        "#220013",
        "#FF1500",
        "#993500",
        "#795100",
        "#436400",
        "#033900",
        "#005735",
        "#00547F",
        "#0000FF",
        "#00454F",
        "#2500CC",
        "#7F7F7F",
        "#202020",
        "#FF0000",
        "#BDFF2D",
        "#AFED06",
        "#64FF09",
        "#108B00",
        "#00FF87",
        "#00A9FF",
        "#002AFF",
        "#3F00FF",
        "#7A00FF",
        "#B21A7D",
        "#402100",
        "#FF4A00",
        "#88E106",
        "#72FF15",
        "#00FF00",
        "#3BFF26",
        "#59FF71",
        "#38FFCC",
        "#5B8AFF",
        "#3151C6",
        "#877FE9",
        "#D31DFF",
        "#FF005D",
        "#FF7F00",
        "#B9B000",
        "#90FF00",
        "#835D07",
        "#392b00",
        "#144C10",
        "#0D5038",
        "#15152A",
        "#16205A",
        "#693C1C",
        "#A8000A",
        "#DE513D",
        "#D86A1C",
        "#FFE126",
        "#9EE12F",
        "#67B50F",
        "#1E1E30",
        "#DCFF6B",
        "#80FFBD",
        "#9A99FF",
        "#8E66FF",
        "#404040",
        "#757575",
        "#E0FFFF",
        "#A00000",
        "#350000",
        "#1AD000",
        "#074200",
        "#B9B000",
        "#3F3100",
        "#B35F00",
        "#4B1502"
    ];
}