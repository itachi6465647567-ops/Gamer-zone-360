const gameCanvas = document.getElementById('emulator-canvas');

// ஆரம்பகட்ட பட்டன் விவரங்கள் மற்றும் அவற்றின் கீபோர்டு ஷார்ட்கட்டுகள்
let controlButtons = [
    { id: 'btn-w', label: 'W', key: 'w', x: 150, y: 400 },
    { id: 'btn-a', label: 'A', key: 'a', x: 100, y: 460 },
    { id: 'btn-s', label: 'S', key: 's', x: 150, y: 460 },
    { id: 'btn-d', label: 'D', key: 'd', x: 200, y: 460 },
    { id: 'btn-jump', label: 'JUMP', key: ' ', x: 1100, y: 500 },
    { id: 'btn-fire', label: 'FIRE', key: 'f', x: 1100, y: 380 }
];

// 1. வெப்சைட்டின் சைடில் கீமேப்பிங் கண்ட்ரோல் பேனல் மற்றும் HUD உருவாக்குதல்
function createInteractiveKeymapperUI() {
    // சைடு பேனல் (Side Toolbar) உருவாக்கம்
    const sidebar = document.createElement('div');
    sidebar.id = 'keymapper-sidebar';
    sidebar.style.position = 'fixed';
    sidebar.style.right = '10px';
    sidebar.style.top = '80px';
    sidebar.style.width = '220px';
    sidebar.style.background = '#16192b';
    sidebar.style.border = '2px solid #00ff66';
    sidebar.style.borderRadius = '8px';
    sidebar.style.padding = '15px';
    sidebar.style.color = '#fff';
    sidebar.style.zIndex = '1000';
    sidebar.style.fontFamily = 'monospace';
    
    sidebar.innerHTML = `<h3 style="margin-top:0; color:#00ff66; font-size:16px; text-align:center;">🎮 Key Mapping HUD</h3><p style="font-size:11px; color:#8b949e; text-align:center;">Drag buttons on screen or click to edit key.</p>`;
    
    const listContainer = document.createElement('div');
    listContainer.id = 'button-config-list';
    sidebar.appendChild(listContainer);
    document.body.appendChild(sidebar);

    // கேம் ஸ்கிரீன் மீது மிதக்கும் பட்டன்கள் (Floating HUD)
    const streamWrapper = document.querySelector('.stream-wrapper');
    streamWrapper.style.position = 'relative';

    controlButtons.forEach((btnConfig, index) => {
        // ஸ்கிரீன் பட்டன் உருவாக்கம்
        const hudBtn = document.createElement('div');
        hudBtn.id = btnConfig.id;
        hudBtn.innerText = `${btnConfig.label} [${btnConfig.key.toUpperCase()}]`;
        hudBtn.style.position = 'absolute';
        hudBtn.style.left = `${btnConfig.x}px`;
        hudBtn.style.top = `${btnConfig.y}px`;
        hudBtn.style.padding = '10px 15px';
        hudBtn.style.background = 'rgba(0, 255, 102, 0.3)';
        hudBtn.style.border = '2px solid #00ff66';
        hudBtn.style.color = '#fff';
        hudBtn.style.borderRadius = '6px';
        hudBtn.style.fontWeight = 'bold';
        hudBtn.style.cursor = 'grab';
        hudBtn.style.userSelect = 'none';
        hudBtn.style.zIndex = '10';

        makeDraggable(hudBtn, btnConfig);
        streamWrapper.appendChild(hudBtn);

        // சைடு பார் லிஸ்ட் ஐட்டம்கள் (Letters & Names Edit செய்ய)
        const itemRow = document.createElement('div');
        itemRow.style.display = 'flex';
        itemRow.style.justifyContent = 'space-between';
        itemRow.style.alignItems = 'center';
        itemRow.style.marginBottom = '8px';
        itemRow.style.background = '#0b0d16';
        itemRow.style.padding = '5px 8px';
        itemRow.style.borderRadius = '4px';

        itemRow.innerHTML = `
            <span style="font-size:12px;">${btnConfig.label}</span>
            <input type="text" maxlength="1" value="${btnConfig.key === ' ' ? 'SPACE' : btnConfig.key}" data-index="${index}" style="width: 40px; background: #222; color: #00ff66; border: 1px solid #4e5579; text-align: center; border-radius: 3px; font-weight:bold;">
        `;
        
        // யூசர் கீயை மாற்றும்போது அதை அப்டேட் செய்தல்
        const inputField = itemRow.querySelector('input');
        inputField.addEventListener('input', (e) => {
            let newVal = e.target.value.toLowerCase();
            if(newVal) {
                controlButtons[index].key = newVal === 'space' ? ' ' : newVal;
                hudBtn.innerText = `${btnConfig.label} [${newVal.toUpperCase()}]`;
            }
        });

        listContainer.appendChild(itemRow);
    });
}

// 2. மவுஸ் மூலம் பட்டன்களை ஸ்கிரீனில் எங்கு வேண்டுமானாலும் நகர்த்தும் வசதி (Drag & Drop)
function makeDraggable(element, config) {
    let isDragging = false;
    let startX, startY;

    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - element.offsetLeft;
        startY = e.clientY - element.offsetTop;
        element.style.cursor = 'grabbing';
        e.stopPropagation();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        config.x = e.clientX - startX;
        config.y = e.clientY - startY;
        element.style.left = `${config.x}px`;
        element.style.top = `${config.y}px`;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        element.style.cursor = 'grab';
    });
}

// 3. கீபோர்டில் லெட்டர் அழுத்தும்போது அது சம்மந்தப்பட்ட HUD பட்டனைத் தொட்டு சிக்னல் அனுப்புதல்
window.addEventListener('keydown', function(event) {
    // இன்புட் பாக்ஸில் டைப் செய்யும்போது கேம் கண்ட்ரோல் ஒர்க் ஆகாமல் இருக்க தடுப்பது
    if (event.target.tagName === 'INPUT') return;

    const pressedKey = event.key.toLowerCase();
    
    controlButtons.forEach(btnConfig => {
        if (btnConfig.key === pressedKey) {
            event.preventDefault();
            const targetElement = document.getElementById(btnConfig.id);
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const canvasRect = gameCanvas.getBoundingClientRect();

                // கேன்வாஸுக்குரிய சரியான டச் கோஆர்டினேட் கணக்கீடு
                const relX = rect.left + rect.width / 2 - canvasRect.left;
                const relY = rect.top + rect.height / 2 - canvasRect.top;

                triggerTouch(canvasRect.left + relX, canvasRect.top + relY);
            }
        }
    });
});

function triggerTouch(clientX, clientY) {
    const downEvent = new PointerEvent('pointerdown', { clientX, clientY, bubbles: true });
    const upEvent = new PointerEvent('pointerup', { clientX, clientY, bubbles: true });
    
    gameCanvas.dispatchEvent(downEvent);
    setTimeout(() => {
        gameCanvas.dispatchEvent(upEvent);
    }, 40);
}

// வெப்சைட் லோட் ஆனவுடன் கீமேப்பர் டூல்பாரை இயக்குதல்
window.addEventListener('DOMContentLoaded', () => {
    createInteractiveKeymapperUI();
});
