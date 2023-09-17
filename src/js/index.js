import { fetchImages } from './api';
import { smoothScroll } from './smooth-scroll';

import Notiflix from 'notiflix';
import 'notiflix/dist/notiflix-3.2.6.min.css';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('#search-form');
const input = document.querySelector('#search-form input');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

let currentPage = 1;
const imagesPerPage = 40;

searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  gallery.innerHTML = '';
  await drawGallery(input.value);
});

async function drawGallery(query) {
  const imagesData = await fetchImages(query, currentPage, imagesPerPage);

  if (currentPage === 1) {
    const totalHits = imagesData.totalHits;
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }
  imagesData.hits.forEach(imageData => {
    const imageCard = createPhotoCard(imageData);
    const lastPage = Math.ceil(fetchImages.totalHits / 40);
    gallery.appendChild(imageCard);
    if (currentPage === lastPage) {
      loadMoreButton.classList.add('is-hidden');
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      loadMoreButton.classList.remove('is-hidden');
    }
  });
}

function createPhotoCard(imageData) {
  const imageContainer = document.createElement('div');
  imageContainer.classList.add('photo-card');

  const a = document.createElement('a');
  a.href = imageData.largeImageURL;
  a.setAttribute('data-lightbox', 'gallery');

  const img = document.createElement('img');
  img.src = imageData.webformatURL;
  img.alt = imageData.tags;
  img.loading = 'lazy';

  a.appendChild(img);

  const info = document.createElement('div');
  info.classList.add('info');

  const likes = createInfoItem('Likes', imageData.likes);
  const views = createInfoItem('Views', imageData.views);
  const comments = createInfoItem('Comments', imageData.comments);
  const downloads = createInfoItem('Downloads', imageData.downloads);

  info.appendChild(likes);
  info.appendChild(views);
  info.appendChild(comments);
  info.appendChild(downloads);

  imageContainer.appendChild(img);
  imageContainer.appendChild(info);

  new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 1000,
  }).refresh();

  setTimeout(() => {
    smoothScroll();
  }, 0);

  return imageContainer;
}

function createInfoItem(label, value) {
  const item = document.createElement('p');
  item.classList.add('info-item');
  item.innerHTML = `<b>${label}:</b> ${value}`;
  return item;
}
loadMoreButton.addEventListener('click', async () => {
  currentPage++;
  const query = input.value;
  await drawGallery(query);
});
