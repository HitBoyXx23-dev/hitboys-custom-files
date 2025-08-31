(() => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const previews = document.getElementById('previews');

  // Allowed types
  const ALLOWED = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    'txt': 'text/plain'
  };

  function humanSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/(1024*1024)).toFixed(2) + ' MB';
  }

  // Convert real name to H-ext
  function makeModifiedName(name) {
    const lastDot = name.lastIndexOf('.');
    if (lastDot === -1) return name + '.Hfile';
    const base = name.slice(0, lastDot);
    const ext = name.slice(lastDot + 1);
    if (ext.length === 0) return base + '.H';
    return base + '.H' + ext.slice(1);
  }

  // Map H-ext back to real extension
  function normalizeExtension(name) {
    const match = name.toLowerCase().match(/\.([^.]+)$/);
    if (!match) return null;
    let ext = match[1];
    if (ext.startsWith('h') && ext.length > 1) {
      ext = ext[0].replace('h','') + ext.slice(1); // strip H → original
      ext = match[1].slice(1); // Actually just drop the first H
      return ext;
    }
    return match[1];
  }

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      // figure out extension (support H-ext)
      const ext = normalizeExtension(file.name);
      const mime = ext && ALLOWED[ext];

      if (!mime) {
        const card = createCard();
        card.querySelector('.meta .name').textContent = file.name + ' — unsupported';
        card.querySelector('.small').textContent = 'Unsupported file type';
        previews.prepend(card);
        return;
      }

      const url = URL.createObjectURL(file);
      const card = createCard();
      const media = card.querySelector('.preview-media');
      let mediaElement;

      if (mime.startsWith('image/')) {
        mediaElement = document.createElement('img');
        mediaElement.src = url;
        mediaElement.alt = file.name;
      } else if (mime.startsWith('video/')) {
        mediaElement = document.createElement('video');
        mediaElement.src = url;
        mediaElement.controls = true;
      } else if (mime.startsWith('audio/')) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.gap = '8px';
        const audio = document.createElement('audio');
        audio.src = url;
        audio.controls = true;
        wrapper.appendChild(audio);
        mediaElement = wrapper;
      } else if (mime === 'text/plain') {
        mediaElement = document.createElement('textarea');
        mediaElement.spellcheck = false;
        const reader = new FileReader();
        reader.onload = e => { mediaElement.value = e.target.result; };
        reader.readAsText(file);
      }

      media.appendChild(mediaElement);
      card.querySelector('.meta .name').textContent = file.name;
      card.querySelector('.small').textContent = humanSize(file.size);

      // Download button
      card.querySelector('.btn').addEventListener('click', () => {
        let blob;
        if (mediaElement.tagName === 'TEXTAREA') {
          blob = new Blob([mediaElement.value], { type: 'text/plain' });
        } else {
          blob = file.slice(0, file.size, mime);
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

  // drag & drop
  ['dragenter','dragover'].forEach(evt => {
    dropzone.addEventListener(evt, e => {
      e.preventDefault(); e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });
  ['dragleave','drop'].forEach(evt => {
    dropzone.addEventListener(evt, e => {
      e.preventDefault(); e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });
  dropzone.addEventListener('drop', e => {
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', e => {
    if (e.target.files.length) {
      handleFiles(e.target.files);
      fileInput.value = '';
    }
  });
})();
