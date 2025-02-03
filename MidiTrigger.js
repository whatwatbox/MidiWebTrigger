//コントロールパネルの親要素のXPath
const controlPanelParentDivXPath = "/html/body/div[1]/main/div[2]/div";
//トリガーボタンの親要素のXPath
const triggerButtonParentDivXPath = "/html/body/div[1]/main/div[2]/div/div[4]";

//ページ更新時
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message != 'updatePage') {
        //sendResponse('otherMessage:' + request.message);
        return;
    }

    //現在のベージがトリガー制御("https://cluster.mu/e/*/trigger")(*は任意の文字列)でなかった場合は処理を終了する
    if (!location.href.match(/^https:\/\/cluster\.mu\/e\/.+\/trigger$/)) {
        //sendResponse('notTriggerControlPage');
        return;
    }

    //ページ更新
    onPageUpdate();

    console.log('updatePage');
});

//ページ内の更新を監視する
function onPageUpdate() {

    //ページ内にis_setupという要素があるか確認する
    const isSetupElement = document.querySelector("div[class^='is_setup']");

    //controlPanelDivがある場合は無視する
    if (isSetupElement != null)
        return;

    //is_setupという要素を追加する
    const div = document.createElement("div");
    div.className = "is_setup";
    document.body.appendChild(div);

    //ページ内にh2のトリガー制御という要素が見つかるまで1秒ごとに監視
    const intervalId = setInterval(() => {
        const h2Elements = document.querySelectorAll("h2");
        h2Elements.forEach((h2Element) => {
            if (h2Element.textContent === "トリガー制御") {
                clearInterval(intervalId);
                initialize();
                return;
            }
        });
    }, 1000);
}

//初期化
function initialize() {
    //コントロールパネルの親要素を取得
    const controlPanelParentDiv = getElementByXPath(controlPanelParentDivXPath);
    
    //-----------------------　コントロールパネル　-----------------------

    //コントロールパネルの表示・非表示を切り替えるためのボタンを追加する
    const foldoutButton = document.createElement("button");
    foldoutButton.textContent = "▼ MIDIトリガー設定";
    foldoutButton.style.margin = "5px";
    foldoutButton.style.padding = "5px";
    foldoutButton.style.border = "1px solid #ccc";
    controlPanelParentDiv.insertBefore(foldoutButton, controlPanelParentDiv.firstChild);

    //コントロールパネルの要素を格納するdiv要素を作成する
    const controlPanelDiv = document.createElement("div");
    controlPanelDiv.id = "control_panel";
    controlPanelDiv.style.display = "none";
    controlPanelParentDiv.insertBefore(controlPanelDiv, controlPanelParentDiv.firstChild);

    //ボタンをクリックしたときに、コントロールパネルの表示・非表示を切り替えるようにする
    foldoutButton.addEventListener("click", () => {
        if (controlPanelDiv.style.display === "none") {
            controlPanelDiv.style.display = "block";
            foldoutButton.textContent = "▲ MIDIトリガー設定";
        } else {
            controlPanelDiv.style.display = "none";
            foldoutButton.textContent = "▼ MIDIトリガー設定";
        }
    });

    //コントロールパネルの要素を、controlPanelDivに追加する
    const controlPanelFieldset = document.createElement("fieldset");
    controlPanelFieldset.innerHTML = "<legend>MIDIトリガー設定</legend>";
    controlPanelFieldset.style.margin = "5px";
    controlPanelFieldset.style.padding = "5px";
    controlPanelFieldset.style.border = "1px solid #ccc";
    controlPanelDiv.appendChild(controlPanelFieldset);

    //-----------------------　デバイス選択　-----------------------

    //デバイス選択用fieldsetを追加する
    const deviceSelectFieldset = document.createElement("fieldset");
    deviceSelectFieldset.innerHTML = "<legend>デバイス選択</legend>";
    deviceSelectFieldset.style.margin = "5px";
    deviceSelectFieldset.style.padding = "5px";
    deviceSelectFieldset.style.border = "1px solid #ccc";
    controlPanelFieldset.appendChild(deviceSelectFieldset);

    //deviceSelectFieldsetにドロップダウンリスト要素を追加する
    const dropdownList = document.createElement("select");
    dropdownList.style.margin = "5px";
    dropdownList.style.padding = "5px";
    dropdownList.style.border = "1px solid #ccc";
    deviceSelectFieldset.appendChild(dropdownList);

    //ドロップダウンリスト選択変更時の処理を指定する
    dropdownList.addEventListener("change", onDropdownListChange);

    //ドロップダウンリストに変更を通知する
    dropdownList.dispatchEvent(new Event("change"));

    //-----------------------　割当解除　-----------------------

    //割当解除用fieldsetを追加する
    const releaseFieldset = document.createElement("fieldset");
    releaseFieldset.innerHTML = "<legend>割当解除</legend>";
    releaseFieldset.style.margin = "5px";
    releaseFieldset.style.padding = "5px";
    releaseFieldset.style.border = "1px solid #ccc";
    controlPanelFieldset.appendChild(releaseFieldset);

    //割当解除用チェックボックスを追加する
    const releaseCheckbox = document.createElement("input");
    releaseCheckbox.type = "checkbox";
    releaseCheckbox.id = "release_checkbox";
    releaseFieldset.appendChild(releaseCheckbox);

    //割当解除用チェックボックスのラベルを追加する
    const releaseCheckboxLabel = document.createElement("label");
    releaseCheckboxLabel.htmlFor = releaseCheckbox.id;
    releaseCheckboxLabel.textContent = "割当解除モード";
    releaseFieldset.appendChild(releaseCheckboxLabel);

    //割当解除用チェックボックス変更時の処理を指定する
    releaseCheckbox.addEventListener("change", onReleaseCheckboxChange);

    //すべて割当解除用ボタンを追加する
    const releaseAllButton = document.createElement("button");
    releaseAllButton.textContent = "すべて割当解除";
    releaseAllButton.style.margin = "5px";
    releaseAllButton.style.padding = "5px";
    releaseAllButton.style.border = "1px solid #ccc";
    releaseFieldset.appendChild(releaseAllButton);

    //すべて割当解除用ボタンクリック時の処理を指定する
    releaseAllButton.addEventListener("click", onReleaseAllButtonClick);

    //-----------------------　保存・読み込み　-----------------------

    //保存・読み込み用fieldsetを追加する
    const saveFieldset = document.createElement("fieldset");
    saveFieldset.innerHTML = "<legend>保存・読み込み</legend>";
    saveFieldset.style.margin = "5px";
    saveFieldset.style.padding = "5px";
    saveFieldset.style.border = "1px solid #ccc";
    controlPanelFieldset.appendChild(saveFieldset);

    //保存ボタンを追加する
    const saveButton = document.createElement("button");
    saveButton.textContent = "保存";
    saveButton.style.margin = "5px";
    saveButton.style.padding = "5px";
    saveButton.style.border = "1px solid #ccc";
    saveFieldset.appendChild(saveButton);

    //保存ボタンクリック時の処理を指定する
    saveButton.addEventListener("click", onSaveButtonClick);

    //読み込みボタンを追加する
    const loadButton = document.createElement("button");
    loadButton.textContent = "読み込み";
    loadButton.style.margin = "5px";
    loadButton.style.padding = "5px";
    loadButton.style.border = "1px solid #ccc";
    saveFieldset.appendChild(loadButton);

    //読み込みボタンクリック時の処理を指定する
    loadButton.addEventListener("click", onLoadButtonClick);

    //-----------------------　トリガーボタン監視　-----------------------

    //トリガーボタンの親要素を取得
    const triggerButtonParentDiv = getElementByXPath(triggerButtonParentDivXPath);

    //triggerButtonParentDivの更新を監視する
    const observer = new MutationObserver((mutations) => {
        //更新時の処理
        onTriggerButtonParentDivUpdate(mutations);
    });

    //triggerButtonParentDivの更新を監視する
    observer.observe(triggerButtonParentDiv, { childList: true });
}

/**
 * 指定された XPath に一致する最初の要素を取得します。
 *
 * @param {string} xpathExpression - 取得対象の XPath 式
 * @returns {Node|null} - 見つかった要素、存在しない場合は null
 */
function getElementByXPath(xpathExpression) {
    const result = document.evaluate(
        xpathExpression,       // XPath 式
        document,              // コンテキストノード
        null,                  // namespaceResolver（不要な場合は null）
        XPathResult.FIRST_ORDERED_NODE_TYPE, // 最初の一致ノードを取得
        null                   // 既存の XPathResult（新規作成の場合は null）
    );
    return result.singleNodeValue;
}

let midiDevices = [];
let currentMidiDevice = null;

//ドロップダウンリスト選択変更時の処理
function onDropdownListChange(event) {
    //対象のドロップダウンリスト
    const targetDropdownList = event.target;
    //現在選択されているオプション要素を取得する
    const selectedOption = targetDropdownList.options[event.target.selectedIndex];

    //selectedOptionがundefinedかデバイス更新用の場合の処理
    if (selectedOption === undefined || selectedOption.value === "デバイス更新") {
        //Midiデバイスを取得する
        MidiDevice.getMidiDeviceList().then((midiDeviceList) => {
            midiDevices = midiDeviceList;
            //ドロップダウンリストをクリアする
            targetDropdownList.innerHTML = "";

            //ドロップダウンリストに選択肢を追加する
            midiDevices.forEach((midiDevice) => {
                const option = document.createElement("option");
                option.value = midiDevice.name;
                option.textContent = midiDevice.name;
                targetDropdownList.appendChild(option);
            });

            //デバイス更新用の選択肢を追加する
            const option = document.createElement("option");
            option.value = "デバイス更新";
            option.textContent = "デバイス更新";
            targetDropdownList.appendChild(option);

            //ドロップダウンリストに変更を通知する
            targetDropdownList.dispatchEvent(new Event("change"));
        });
        return;
    }

    //Midiデバイスがない場合は処理を終了する
    if (midiDevices.length === 0)
        return;

    //現在選択中のMidiDeviceがある場合はMidiMessage受信時の処理を解除する
    if (currentMidiDevice != null) {
        currentMidiDevice.onMidiInput = null;
    }

    //midiDevicesから対象のMidiDeviceを取得する
    currentMidiDevice = midiDevices.find((midiDevice) => {
        return midiDevice.name === selectedOption.value;
    });

    console.log("選択中：" + currentMidiDevice.name);
    //midiMessage受信時の処理を指定する
    currentMidiDevice.onMidiInput = onMidiInput;
}

//すべてのTriggerButton
let triggerButtons = [];

//triggerButtonParentDivの更新時の処理
function onTriggerButtonParentDivUpdate(mutations) {
    //初期化
    triggerButtons = [];
    //すべてのmutationに対して処理を行う
    mutations.forEach((mutation) => {
        //追加されたノードを取得
        const addedNode = mutation.addedNodes[0];
        //TriggerButtonを取得する
        const triggerButton = TriggerButton.getTriggerButton(addedNode);

        //ラジオボタンを設定する
        triggerButton.setupRadio();
        //ラジオボタンの変更時の処理を指定する
        triggerButton.radio.addEventListener("change", () => {
            onRadioChange(triggerButton);
        });
        //ラジオボタンクリック時の処理を指定する
        triggerButton.radio.addEventListener("click", () => {
            onRadioClick(triggerButton);
        });

        //配列に追加する
        triggerButtons.push(triggerButton);
    });
}

//現在選択中のTriggerButton
let selectedTriggerButton = null;

//ラジオボタンの変更時の処理
function onRadioChange(triggerButton) {
    //現在選択中のTriggerButtonを更新する
    selectedTriggerButton = triggerButton;
    console.log("選択中：" + selectedTriggerButton.name);

    //割当解除モードを無効にする
    isReleaseMode = false;
    //割当解除用チェックボックスの状態を更新する
    const releaseCheckbox = document.getElementById("release_checkbox");
    releaseCheckbox.checked = isReleaseMode;
}

//ラジオボタンクリック時の処理
function onRadioClick(triggerButton) {
    //現在選択中のTriggerButtonと同じ場合は選択を解除する
    if (selectedTriggerButton == triggerButton) {
        selectedTriggerButton = null;
        triggerButton.radio.checked = false;
        console.log("選択解除");
    }
}

//割当解除用チェックボックスの状態
let isReleaseMode = false;

//割当解除用チェックボックス変更時の処理
function onReleaseCheckboxChange(event) {
    //対象のチェックボックス
    const targetCheckbox = event.target;
    //割当解除用チェックボックスの状態を更新する
    isReleaseMode = targetCheckbox.checked;
}

//すべて割当解除用ボタンクリック時の処理
function onReleaseAllButtonClick(event) {
    //確認ダイアログを表示する
    const result = window.confirm("すべての割当を解除しますか？");
    //キャンセルされた場合は処理を終了する
    if (!result)
        return;

    //すべてのMidiMapを削除する
    midiMapList = [];
    console.log("すべて割当解除");

    //すべてのボタンの色を黒にする
    for (let i = 0; i < 128; i++) {
        currentMidiDevice.setButtonState(DisplayPattern.off, i, "#000000");
    }

    //midiMapListをクリアする
    midiMapList = [];
}

//保存ボタンクリック時の処理
function onSaveButtonClick(event) {
    //MidiMapをmidiMap.presetという名前でjson形式でダウンロードする
    const json = JSON.stringify(midiMapList);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "midiMap.preset";
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

//読み込みボタンクリック時の処理
function onLoadButtonClick(event) {
    //ファイル選択ダイアログを表示する
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".preset";
    input.addEventListener("change", (event) => {
        //ファイルを読み込む
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener("load", (event) => {
            //jsonをMidiMapに変換する
            const json = event.target.result;
            const midiMapJson = JSON.parse(json);

            //MidiMapListをクリアする
            midiMapList = [];

            //MidiMapを更新する
            midiMapJson.forEach((midiMap) => {
                midiMapList.push(new MidiMap(midiMap.name, midiMap.channel, midiMap.note));
            });

            console.log(midiMapList);
            //ボタンの色を更新する
            updateButtonColor();
        });
    });
    input.click();
    input.remove();
}

//ボタンの色を更新する
function updateButtonColor() {
    //triggerButtonsがない場合は処理を終了する
    if (triggerButtons.length === 0) {
        alert("トリガーが読み込まれていません\n色変更をスキップします");
        console.log("トリガーが読み込まれていません");
        return;
    }

    //すべてのボタンの色を黒にする
    for (let i = 0; i < 128; i++) {
        currentMidiDevice.setButtonState(DisplayPattern.off, i, "#000000");
    }

    //MidiMapListのボタンの色を更新する
    midiMapList.forEach((midiMap) => {
        //midiMap.nameからTriggerButtonを取得する
        const triggerButton = triggerButtons.find((triggerButton) => {
            return triggerButton.name === midiMap.name;
        });
        //triggerButtonがある場合は色を更新する
        if (triggerButton != null) {
            currentMidiDevice.setButtonState(DisplayPattern.on, midiMap.note, triggerButton.color);
        }
    });
}

//MidiMap
let midiMapList = [];

//MidiMessage受信時の処理
function onMidiInput(channel, note) {
    console.log("受信 #" + channel + " " + note);
    //割当解除モードの場合
    if (isReleaseMode) {
        //midiMapListからnoteが一致するMidiMapを取得する
        const sameNoteMidiMap = midiMapList.find((midiMap) => {
            return midiMap.note === note && midiMap.channel === channel;
        });
        //midiMapがある場合は削除する
        if (sameNoteMidiMap != null) {
            //midiMapListから削除する
            midiMapList = midiMapList.filter((midiMap) => {
                return !(midiMap.note === note && midiMap.channel === channel);
            });
            console.log("削除：" + sameNoteMidiMap.name + " #" + channel + " " + note);
        }
        //対象のボタンの色を黒に
        currentMidiDevice.setButtonState(DisplayPattern.off, note, "#000000");
        return;
    }

    //現在選択中のTriggerButtonがある場合
    if (selectedTriggerButton != null) {
        //midiMapListからnoteが一致するMidiMapを取得する
        const sameNoteMidiMap = midiMapList.find((midiMap) => {
            return midiMap.note === note;
        });

        //midiMapがある場合は削除する
        if (sameNoteMidiMap != null) {
            //midiMapListから削除する
            midiMapList = midiMapList.filter((midiMap) => {
                return midiMap.note !== note;
            });
            console.log("削除：" + sameNoteMidiMap.name + " #" + channel + " " + note);
        }

        //midiMapListから名前が一致するMidiMapを取得する
        const sameNameMidiMap = midiMapList.find((midiMap) => {
            return midiMap.name === selectedTriggerButton.name;
        });
        //midiMapがある場合はnoteを更新する
        if (sameNameMidiMap != null) {
            //対象のボタンの色を黒に
            currentMidiDevice.setButtonState(DisplayPattern.off, sameNameMidiMap.note, "#000000");
            //noteを更新する
            sameNameMidiMap.note = note;
            console.log("更新：" + sameNameMidiMap.name + " #" + channel + " " + note);
        }
        //midiMapListに名前が存在しない場合は追加する
        else {
            midiMapList.push(new MidiMap(selectedTriggerButton.name, channel, note));
            console.log("追加：" + selectedTriggerButton.name + " #" + channel + " " + note);
        }

        //現在のデバイスに色情報を送信する
        currentMidiDevice.setButtonState(DisplayPattern.on, note, selectedTriggerButton.color);

        //ラジオボタンの選択を解除する
        selectedTriggerButton.radio.checked = false;
        //現在選択中のTriggerButtonを解除する
        selectedTriggerButton = null;

        console.log(midiMapList);

        return;
    }

    //現在選択中のTriggerButtonがない場合
    //midiMapListにnoteが存在する場合
    const midiMap = midiMapList.find((midiMap) => {
        return midiMap.note === note;
    });

    //midiMapがない場合は処理を終了する
    if (midiMap == null)
        return;

    //midiMap.nameからTriggerButtonを取得する
    const triggerButton = triggerButtons.find((triggerButton) => {
        return triggerButton.name === midiMap.name;
    });

    //triggerButtonがある場合はクリックする
    if (triggerButton != null) {
        triggerButton.click();
        console.log("クリック：" + triggerButton.name);
    }
}