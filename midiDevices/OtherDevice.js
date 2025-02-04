class OtherDevice extends MidiDevice {
    constructor(deviceName, midiInput, midiOutput, onMidiInput) {
        super(deviceName + "(色変更非対応)", midiInput, midiOutput, onMidiInput);
    }

    //ボタンの状態を変更する
    setButtonState(pattern, note, color) {
        //非対応
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
        //Velocityを取得する
        const velocity = midiMessage[2];

        //console.log(`MidiInputRaw: ${event.data}, note: ${note}, channel: ${channel}, isNoteOn: ${isNoteOn}, velocity: ${velocity}`);

        //NoteOnの場合は呼び出す
        if(isNoteOn)
        {
            //親クラスのonMidiInputがundefinedでない場合は呼び出す
            if(this.onMidiInput != null)
                this.onMidiInput(channel, note);
        }
    }
}