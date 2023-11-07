//ページがロードされたときの処理
chrome.tabs.onUpdated.addListener(function(tabId, info, tab)
{
    //現在のタブ取得
    chrome.tabs.query({active:true, currentWindow:true}, function(tabs)
    {
        //データ送信
        chrome.tabs.sendMessage(tabs[0].id, {message:'updatePage'})
        .then(item =>
        {
            console.log(item);
        })
        .catch(err =>
        {
            console.log('error:' + err);
        });
    });
});
