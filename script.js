(() => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const previewsTab = document.getElementById('previews');
  const normalTab = document.getElementById('normal');
  const tabs = document.querySelectorAll('.tab');

  // Allowed real extensions
  const ALLOWED = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    'txt': 'text/plain'
  };

  // Get extension without dot
  function getExt(name) {
    const m = name.toLowerCase().match(/\.([^.]+)$/);
    return m ? m[1] : '';
  }

  // Check if starts with H
  function isHExt(name) {
    const ext = getExt(name);
    return ext.startsWith('h') && ext.length > 1;
  }

  // Convert H-ext → real ext
  function realExt(name) {
    const ext = getExt(name);
    if (ext.startsWith('h') && ext.length > 1) {
      return ext.slice(1); // "hng" → "ng"
    }
    return ext;
  }

  // Human readable file size
  function humanSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  // Handle uploads
  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (isHExt(file.name)) {
        showPreview(file);
      } else {
        listNormal(file);
      }
    });
  }

  // Show preview for H-ext files
  function showPreview(file) {
    const ext = realExt(file.name);
    const mime = ALLOWED[ext] || '';
    const url = URL.createObjectURL(file);

    const card = document.createElement('article');
    card.className = 'card';
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = file.name + ' (' + humanSize(file.size) + ')';
    card.appendChild(name);

    let media;
    if (mime.startsWith('image/')) {
      media = document.createElement('img');
      media.src = url;
      media.style.maxWidth = '200px';
    } else if (mime.startsWith('video/')) {
      media = document.createElement('video');
      media.src = url;
      media.controls = true;
      media.width = 200;
    } else if (mime.startsWith('audio/')) {
      media = document.createElement('audio');
      media.src = url;
      media.controls = true;
    } else if (mime === 'text/plain') {
      media = document.createElement('textarea');
      media.readOnly = true;
      const reader = new FileReader();
      reader.onload = e => media.value = e.target.result;
      reader.readAsText(file);
    } else {
      media = document.createElement('div');
      media.textContent = 'Preview not supported (.' + ext + ')';
    }

    card.appendChild(media);
    previewsTab.prepend(card);
  }

  // Show normal files (no preview, just rename box)
  function listNormal(file) {
    const card = document.createElement('article');
    card.className = 'card';
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = file.name + ' (' + humanSize(file.size) + ')';
    card.appendChild(name);

    const renameBox = document.createElement('textarea');
    renameBox.className = 'rename';
    renameBox.value = file.name;
    card.appendChild(renameBox);

    normalTab.prepend(card);
  }

  // Tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // drag & drop
  ['dragenter','dragover'].forEach(evt => {
    dropzone.addEventListener(evt, e => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });
  ['dragleave','drop'].forEach(evt => {
    dropzone.addEventListener(evt, e => {
      e.preventDefault();
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
