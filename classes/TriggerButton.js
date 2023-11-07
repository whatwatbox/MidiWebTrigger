class TriggerButton
{
    static getTriggerButton(parentElement)
    {
        const button = parentElement.querySelector("button");
        //子のp要素を取得する
        const p = button.querySelector("p");
        //p要素のテキストを取得する
        const name = p.textContent;
        //p要素のtriggercolor属性を取得する
        const color = p.getAttribute("triggercolor");

        return new TriggerButton(
            name,
            color,
            button
        );
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