window.onload = async () => {
    const res = await window.ipc.invoke('ready-file',  '/chat/20240411/chat.json');
    let chatJson = {};
    try {
        chatJson = JSON.parse(res);
    } catch (e) {
        console.log(e);
    }
    let content = document.querySelector('.message-li')
    chatJson.messages.forEach((el, index) => {
        let li = document.createElement('li')
        li.className = 'group p-2 mb-4 flex transition-all'

        let avatarDiv = document.createElement('div');
        avatarDiv.className = 'sender-avatar w-[28px] h-[28px] mr-1'
        let avatar = document.createElement('img');
        avatar.src = '../image/yogurt.svg';
        avatarDiv.appendChild(avatar);
        li.appendChild(avatarDiv)

        // 内容得父级
        let div = document.createElement('div');
        div.className = 'w-1/2  rounded-lg px-2';
        // 内容中得头像
        let senderName = document.createElement('p');
        senderName.className = 'sender-name min-h-[14px] px-1 rounded-lg w-[125px] text-xs inline-block'

        if (el.sender) {
            senderName.innerHTML = el.sender;
        }
        div.appendChild(senderName);
        // 内容
        let messageDiv = document.createElement('div');
        messageDiv.className = 'bg-white p-2 mt-1 min-h-[25px] rounded-lg text-left';

        const status =  el.sender && chatJson.me && chatJson.me === el.sender;
        if (status) {
            messageDiv.classList.add('!bg-green-300')
            messageDiv.classList.add('hover:!bg-green-400')
            li.classList.add('sender-me')
        }
        messageDiv.innerHTML = el.content
        div.appendChild(messageDiv);
        li.appendChild(div)
        content.appendChild(li)
    })
    const lis = document.querySelectorAll('li.animate-pulse');
    lis.forEach(el => {
        el.classList.add('!hidden')
    })
}
