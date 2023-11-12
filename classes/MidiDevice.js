class MidiDevice {
    constructor(name, midiInput, midiOutput, onMidiInput) {
        this.name = name;
        this.midiInput = midiInput;
        this.midiOutput = midiOutput;
        this.onMidiInput = onMidiInput;

        this.midiInput.onmidimessage = this.onMidiMessage.bind(this);
    }

    //inputNameとoutputNameが一致するかどうかを返す
    static isMatch(inputName, outputName) {
        if(this.inputName === undefined || this.outputName === undefined)
            throw new Error("inputNameかoutputNameが定義されていません。");

        return this.inputName === inputName && this.outputName === outputName;
    }

    //Midiデバイスを取得する
    static async getMidiDeviceList() {
        const midiDeviceList = [];
        const devices = await navigator.requestMIDIAccess().then(access => access);
        const inputs = devices.inputs;
        const outputs = devices.outputs;

        inputs.forEach(input => {
            outputs.forEach(output => {
                const midiDevice = MidiDeviceFactory.create(input.name, output.name, input, output);
                if (midiDevice === null) {
                    return;
                }
                midiDeviceList.push(midiDevice);
            });
        });
        return midiDeviceList;
    }

    //ボタンの状態を変更する
    setButtonState(pattern, note, color) {
        throw new Error("setButtonState is not implemented.");
    }
    //midiメッセージを受け取ったときの処理
    onMidiMessage(event) {
        throw new Error("onmidimessage is not implemented.");
    }

    //Pattenから値を取得する
    getPatternValue(pattern) {

        //displayPatternがない場合はnullを返す
        if (this.displayPattern === undefined) {
            return null;
        }

        switch (pattern) {
            case DisplayPattern.select:
                return this.displayPattern.select;
            case DisplayPattern.on:
                return this.displayPattern.on;
            case DisplayPattern.off:
                return this.displayPattern.off;
        }

        return null;
    }

     //引数のカラーコードに近いカラーコードをcolorListから取得し、そのインデックスを返す
     getNearColorIndex(color) {
        //colorListがない場合はnullを返す
        if (this.colorList === undefined) {
            return null;
        }

        //colorListの中から引数のカラーコードに近いカラーコードを取得する
        let nearColorIndex = 0;
        let nearColorDistance = 1000000;
        this.colorList.forEach((targetColor, index) => {
            const distance = this.getColorDistance(targetColor, color);
            if (distance < nearColorDistance) {
                nearColorIndex = index;
                nearColorDistance = distance;
            }
        });
        return nearColorIndex;
    }

    //2つのカラーコードをrgbに変換し、距離の2乗を計算する
    getColorDistance(color1, color2) {
        const rgb1 = this.colorToRGB(color1);
        const rgb2 = this.colorToRGB(color2);
        const r = rgb1.r - rgb2.r;
        const g = rgb1.g - rgb2.g;
        const b = rgb1.b - rgb2.b;
        return r * r + g * g + b * b;
    }

    //カラーコードをrgbに変換する
    colorToRGB(color) {
        //先頭の#を削除する
        color = color.slice(1);
        //カラーコードをrgbに変換する
        const r = parseInt(color.slice(0, 2), 16);
        const g = parseInt(color.slice(2, 4), 16);
        const b = parseInt(color.slice(4, 6), 16);
        return {r: r, g: g, b: b};
    }
}

//Midiデバイスを作成する
class MidiDeviceFactory
{
    static create(inputName, outputName, midiInput, midiOutput)
    {
        if(APCMiniMK2.isMatch(inputName, outputName))
            return new APCMiniMK2(midiInput, midiOutput);

        if(LaunchpadMiniMK3.isMatch(inputName, outputName))
            return new LaunchpadMiniMK3(midiInput, midiOutput);

        if(inputName === outputName)
            return new OtherDevice(inputName, midiInput, midiOutput);

        return null;
    }
}

//表示パターン
class DisplayPattern {
    constructor(select, on, off) {
        this.select = select;
        this.on = on;
        this.off = off;
    }

    static select = "select";
    static on = "on";
    static off = "off";
}