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
        if (this.inputName === undefined || this.outputName === undefined)
            throw new Error("inputNameかoutputNameが定義されていません。");

        //引数のinputNameとoutputNameがthisと部分一致しているかを正規表現で確認し、一致していればtrueを返す
        return inputName.match(`^${this.inputName}.*`) !== null && outputName.match(`^${this.outputName}.*`) !== null;
    }

    //Midiデバイスを取得する
    static async getMidiDeviceList() {
        const midiDeviceList = [];
        const midiAccess = await navigator.requestMIDIAccess().then(access => access);
        const inputs = midiAccess.inputs;
        const outputs = midiAccess.outputs;

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

    // //2つのカラーコードをrgbに変換し、距離の2乗を計算する
    // getColorDistance(color1, color2) {
    //     const rgb1 = this.colorToRGB(color1);
    //     const rgb2 = this.colorToRGB(color2);
    //     const r = rgb1.r - rgb2.r;
    //     const g = rgb1.g - rgb2.g;
    //     const b = rgb1.b - rgb2.b;
    //     return r * r + g * g + b * b;
    // }

    // //カラーコードをrgbに変換する
    // colorToRGB(color) {
    //     //先頭の#を削除する
    //     color = color.slice(1);
    //     //カラーコードをrgbに変換する
    //     const r = parseInt(color.slice(0, 2), 16);
    //     const g = parseInt(color.slice(2, 4), 16);
    //     const b = parseInt(color.slice(4, 6), 16);
    //     console.log("r:" + r + ", g:" + g + ", b:" + b);
    //     return {r: r, g: g, b: b};
    // }

    /**
     * 16進数カラーコード（例："FFAABB" または "#FFAABB"）をRGBオブジェクトに変換する関数
     * ※すでにcolorToRGB()がある場合はそちらを利用してください
     */
    colorToRGB(color) {
        // '#'が先頭にあれば取り除く
        if (color.startsWith("#")) {
            color = color.slice(1);
        }
        // 3桁の場合は6桁に展開する
        if (color.length === 3) {
            color = color.split("").map(c => c + c).join("");
        }
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        return { r, g, b };
    }

    /**
     * RGBからHSVへ変換する関数
     * r,g,b は 0～255 の整数として与え、hは0～1, s,vは0～1の実数として返す
     */
    rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        let h = 0, s = 0, v = max;

        s = max === 0 ? 0 : delta / max;

        if (delta === 0) {
            h = 0; // 色相は不定（任意の値でよい）
        } else {
            if (max === r) {
                h = ((g - b) / delta) % 6;
            } else if (max === g) {
                h = (b - r) / delta + 2;
            } else {
                h = (r - g) / delta + 4;
            }
            h /= 6;
            if (h < 0) {
                h += 1;
            }
        }
        return { h, s, v };
    }

    /**
     * 2つのカラーコードのHSV空間上での色の距離を計算する関数
     *
     * 計算方法:
     *  - Hueは0～1の循環値（例: 0.95 と 0.05 は0.1の差とする）として扱い、その差分を求める
     *  - Saturation, Valueは通常の線形差分
     *  - 最終的な距離はユークリッド距離（必要に応じて各成分に重みをつけることも可能）
     *
     * @param {string} color1 例："FFAABB" または "#FFAABB"
     * @param {string} color2 例："112233" または "#112233"
     * @returns {number} 色の距離（小さいほど似ている）
     */
    getColorDistance(color1, color2) {
        // それぞれRGBに変換
        const rgb1 = this.colorToRGB(color1);
        const rgb2 = this.colorToRGB(color2);

        // RGBからHSVへ変換
        const hsv1 = this.rgbToHsv(rgb1.r, rgb1.g, rgb1.b);
        const hsv2 = this.rgbToHsv(rgb2.r, rgb2.g, rgb2.b);

        // Hueの差は循環しているので、最小の角度差を求める
        const dh = Math.min(
            Math.abs(hsv1.h - hsv2.h),
            1 - Math.abs(hsv1.h - hsv2.h)
        );
        const ds = hsv1.s - hsv2.s;
        const dv = hsv1.v - hsv2.v;

        // 必要に応じて重みを変えられます。ここではすべて同等としています。
        const distanceSquared = dh * dh + ds * ds + dv * dv;
        return Math.sqrt(distanceSquared);
    }
}

//Midiデバイスを作成する
class MidiDeviceFactory {
    static create(inputName, outputName, midiInput, midiOutput) {
        if (APCMiniMK2.isMatch(inputName, outputName))
            return new APCMiniMK2(midiInput, midiOutput);

        if (LaunchpadMiniMK3.isMatch(inputName, outputName))
            return new LaunchpadMiniMK3(midiInput, midiOutput);

        if (inputName === outputName)
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