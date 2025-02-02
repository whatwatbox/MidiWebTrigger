class TriggerButton
{
    // static getTriggerButton(parentElement)
    // {
    //     const button = parentElement.querySelector("button");
    //     //子のp要素を取得する
    //     const p = button.querySelector("p");
    //     //p要素のテキストを取得する
    //     const name = p.textContent;
    //     //p要素のtriggercolor属性を取得する
    //     const color = p.getAttribute("triggercolor");

    //     return new TriggerButton(
    //         name,
    //         color,
    //         button
    //     );
    // }

    static getTriggerButton(parentElement) {
        const button = parentElement.querySelector("button");
        // 子のp要素を取得する
        const p = button.querySelector("p");
        // p要素のテキストを取得する
        const name = p.textContent;
    
        // 親要素を取得する
        var buttonParent = button.parentElement;
        // 親要素のcomputed styleからbackground-colorを取得する
        const computedStyle = window.getComputedStyle(buttonParent);
        const bgColor = computedStyle.backgroundColor;
    
        // 変換したカラーコード
        const color = this.rgbToHex(bgColor);
    
        return new TriggerButton(
            name,
            color,
            button
        );
    }

    // rgbまたはrgba表記を16進数表記(例："FFFFFF")に変換する関数
    static rgbToHex(rgb) {
        // "rgb(255, 255, 255)" または "rgba(255, 255, 255, 1)" の形式に対応
        const result = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!result) return null;
        const r = parseInt(result[1], 10);
        const g = parseInt(result[2], 10);
        const b = parseInt(result[3], 10);
        // 各値を2桁の16進数文字列に変換し連結
        return (
            ("0" + r.toString(16)).slice(-2) +
            ("0" + g.toString(16)).slice(-2) +
            ("0" + b.toString(16)).slice(-2)
        ).toUpperCase();
    }

    //初期化
    constructor(name, color, button, radio)
    {
        this.name = name;
        this.color = color;
        this.button = button;
        this.radio = radio;
    }

    //ラジオボタンを設定する
    setupRadio()
    {
        if(this.radio != null){
            return;
        }

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "select_trigger";
        this.radio = radio;
        const parentElement = this.button.parentElement;
        parentElement.insertBefore(radio, parentElement.firstChild);
    }

    //クリックする
    click()
    {
        this.button.click();
    }
}