const aboutBioFieldsEl = document.getElementById('about-bio-fields');
const aboutSocialFieldsEl = document.getElementById('about-social-fields');
const aboutStripImagesEl = document.getElementById('about-strip-images');
const aboutStripAddBtn = document.getElementById('about-strip-add-btn');
const aboutPortraitPreview = document.getElementById('about-portrait-preview');
const aboutPortraitFile = document.getElementById('about-portrait-file');
const aboutSaveBtn = document.getElementById('about-save-btn');

let aboutSchema = null;
let aboutData = null;
let stripRows = [];

async function loadAboutContent() {
  try {
    const { schema, data } = await fetchJSON('/api/about');
    aboutSchema = Object.fromEntries(schema.map((f) => [f.key, f]));
    aboutData = data;
    renderAbout();
  } catch (err) {
    showStatus(err.message, true);
  }
}

function addStripRow(image) {
  const row = document.createElement('div');
  row.className = 'about-strip-row';

  const preview = document.createElement('img');
  preview.className = 'about-admin-preview about-admin-preview-sm';
  preview.alt = '';
  if (image && image.path) preview.src = `/site-assets${image.path}`;
  row.appendChild(preview);

  const controls = document.createElement('div');
  controls.className = 'about-strip-row-controls';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) {
      preview.src = URL.createObjectURL(fileInput.files[0]);
    }
  });
  controls.appendChild(fileInput);

  const cropLabel = document.createElement('label');
  cropLabel.className = 'about-strip-crop-label';
  const cropCheckbox = document.createElement('input');
  cropCheckbox.type = 'checkbox';
  cropCheckbox.checked = Boolean(image && image.cropTop);
  cropLabel.appendChild(cropCheckbox);
  cropLabel.appendChild(document.createTextNode(' Crop from top (for photos with little headroom)'));
  controls.appendChild(cropLabel);

  row.appendChild(controls);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'admin-icon-btn danger';
  removeBtn.title = 'Remove';
  removeBtn.textContent = '✕';
  removeBtn.addEventListener('click', () => {
    row.remove();
    stripRows = stripRows.filter((r) => r.rowEl !== row);
  });
  row.appendChild(removeBtn);

  aboutStripImagesEl.appendChild(row);
  stripRows.push({ path: image ? image.path : '', fileInput, cropCheckbox, rowEl: row });
}

function renderAbout() {
  aboutPortraitPreview.src = `/site-assets${aboutData.portraitImage}`;
  aboutPortraitFile.value = '';

  renderFieldList(aboutBioFieldsEl, [aboutSchema.bioParagraphs], { bioParagraphs: aboutData.bioParagraphs });
  renderFieldList(aboutSocialFieldsEl, [aboutSchema.socialLinks], { socialLinks: aboutData.socialLinks });

  aboutStripImagesEl.innerHTML = '';
  stripRows = [];
  aboutData.stripImages.forEach((image) => addStripRow(image));
}

async function saveAbout() {
  const bio = collectFieldList(aboutBioFieldsEl, [aboutSchema.bioParagraphs]);
  const social = collectFieldList(aboutSocialFieldsEl, [aboutSchema.socialLinks]);
  const stripImages = stripRows.map((r) => ({ path: r.path, cropTop: r.cropCheckbox.checked }));

  const formData = new FormData();
  formData.set(
    'data',
    JSON.stringify({
      bioParagraphs: bio.bioParagraphs,
      socialLinks: social.socialLinks,
      portraitImage: aboutData.portraitImage,
      stripImages,
    })
  );

  if (aboutPortraitFile.files[0]) {
    formData.set('portraitImage', aboutPortraitFile.files[0]);
  }
  stripRows.forEach((r, i) => {
    if (r.fileInput.files[0]) {
      formData.set(`stripImages[${i}]`, r.fileInput.files[0]);
    }
  });

  try {
    const { git, data } = await fetchJSON('/api/about', { method: 'PUT', body: formData });
    aboutData = data;
    renderAbout();
    showStatus('About page saved.' + describeGit(git), false);
  } catch (err) {
    showStatus(err.message, true);
  }
}

aboutStripAddBtn.addEventListener('click', () => addStripRow(null));
aboutSaveBtn.addEventListener('click', saveAbout);
