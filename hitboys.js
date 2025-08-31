(() => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const previews = document.getElementById('previews');

  const ALLOWED = {
    'image/png': true,
    'image/jpeg': true,
    'image/jpg': true,
    'image/gif': true,
    'video/mp4': true,
    'audio/mpeg': true,
    'text/plain': true
  };

  function humanSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/(1024*1024)).toFixed(2) + ' MB';
  }

  function makeModifiedName(name) {
    const lastDot = name.lastIndexOf('.');
    if (lastDot === -1) return name + '.Hfile';
    const base = name.slice(0, lastDot);
    const ext = name.slice(lastDot + 1);
    if (ext.length === 0) return base + '.H';
    const newExt = 'H' + ext.slice(1);
    return base + '.' + newExt;
  }

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      const isAllowed = ALLOWED[file.type] || /\.(png|jpe?g|gif|mp4|mp3|txt)$/i.test(file.name);
      if (!isAllowed) {
        const card = createCard();
        const meta = card.querySelector('.meta .name');
        meta.textContent = file.name + ' — unsupported';
        card.querySelector('.small').textContent = 'Unsupported file type';
        previews.prepend(card);
        return;
      }

      const url = URL.createObjectURL(file);
      const card = createCard();
      const media = card.querySelector('.preview-media');
      let mediaElement;

      if (file.type.startsWith('image/')) {
        mediaElement = document.createElement('img');
        mediaElement.src = url;
        mediaElement.alt = file.name;
      } else if (file.type.startsWith('video/')) {
        mediaElement = document.createElement('video');
        mediaElement.src = url;
        mediaElement.controls = true;
        mediaElement.preload = 'metadata';
      } else if (file.type.startsWith('audio/') || file.type === 'audio/mpeg') {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.gap = '8px';
        const audio = document.createElement('audio');
        audio.src = url;
        audio.controls = true;
        wrapper.appendChild(audio);
        mediaElement = wrapper;
      } else if (file.type === 'text/plain' || /\.txt$/i.test(file.name)) {
        mediaElement = document.createElement('textarea');
        mediaElement.spellcheck = false;
        const reader = new FileReader();
        reader.onload = e => {
          mediaElement.value = e.target.result;
        };
        reader.readAsText(file);
      } else {
        mediaElement = document.createElement('div');
        mediaElement.textContent = file.name;
        mediaElement.className = 'small';
      }

      media.appendChild(mediaElement);
      card.querySelector('.meta .name').textContent = file.name;
      card.querySelector('.small').textContent = humanSize(file.size);

      const dlBtn = card.querySelector('.btn');
      dlBtn.addEventListener('click', () => {
        let blob;
        if (mediaElement.tagName === 'TEXTAREA') {
          blob = new Blob([mediaElement.value], { type: 'text/plain' });
        } else {
          blob = file.slice(0, file.size, file.type || 'application/octet-stream');
        }
        const modified = makeModifiedName(file.name);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = modified;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => { URL.revokeObjectURL(link.href); }, 2000);
      });

      previews.prepend(card);
    });
  }

  function createCard() {
    const wrap = document.createElement('article');
    wrap.className = 'card';
    const media = document.createElement('div');
    media.className = 'preview-media';
    wrap.appendChild(media);
    const meta = document.createElement('div');
    meta.className = 'meta';
    const name = document.createElement('div');
    name.className = 'name';
    meta.appendChild(name);
    const controls = document.createElement('div');
    controls.className = 'controls';
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Download (H-ext)';
    controls.appendChild(btn);
    meta.appendChild(controls);
    wrap.appendChild(meta);
    const small = document.createElement('div');
    small.className = 'small';
    wrap.appendChild(small);
    return wrap;
  }

  ['dragenter', 'dragover'].forEach(evt => {
    dropzone.addEventListener(evt, e => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(evt => {
    dropzone.addEventListener(evt, e => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', e => {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) {
      handleFiles(dt.files);
    }
  });

  fileInput.addEventListener('change', e => {
    if (e.target.files && e.target.files.length) {
      handleFiles(e.target.files);
      fileInput.value = '';
    }
  });
})();
