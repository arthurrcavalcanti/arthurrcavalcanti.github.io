<template>
  <div class="home">
    <div class="header">
      <h2>Lista de vídeos</h2>
      <input type="datetime-local" placeholder="Pesquisar vídeos..." v-model="dataselecionada" />
    </div>
    <!-- Video Player -->
    <div class="video-player" v-if="selectedVideo" :key="videoInfo.path">
      <video controls autoplay>
        <source :src="selectedVideo" type="video/mp4" />
        Seu navegador não suporta vídeos.
      </video>
      <div class="info">
        <small>{{ videoInfo.name }} ({{ videoInfo.size }})</small>
        <small>{{ new Date(videoInfo.created).toLocaleString() }}</small>
      </div>
    </div>

    <!-- Video List -->
    <div class="lista-videos" v-if="listaDeVideosFiltrada">
      <details v-for="directory in listaDeVideosFiltrada" :key="directory.path">
        <summary>{{ directory.name.startsWith('4') ? 'Odorico' : 'Cairú' }}</summary>
        <div v-for="item, idx in directory.videos" :key="item.path" class="video-line">
          
          <a href="#" @click.prevent="playVideo(item.path, item)">{{ item.name }}</a>
          <small>{{ item.size }}</small>
          <small>{{ new Date(item.created).toLocaleString() }}</small>
        </div>
      </details>
    </div>

    <p v-else>Carregando lista de vídeos...</p>
  </div>
</template>

<script>
import { getVideoList, getVideoStreamUrl } from '@/services/api.js';

export default {
  name: 'HomeView',
  data() {
    return {
      listaDeVideos: null,
      listaDeVideosFiltrada: null,
      selectedVideo: null,
      videoInfo: null,
      dataselecionada: undefined
    };
  },
  watch: {
    dataselecionada: function (newDate) {
      console.log(newDate);
      if(newDate){
        const date = new Date(newDate);
        const dataMin = new Date(date.getTime() - 60 * 60 * 1000);
        const dataMax = new Date(date.getTime() + 60 * 60 * 1000);
        const dataMinText = dataMin.toISOString();
        const dataMaxText = dataMax.toISOString();

        console.log({newDate, dataMinText, dataMaxText});
        // Filter directories and their videos
        this.listaDeVideosFiltrada = this.listaDeVideos
          .map((diretorio) => {
            // Filter videos within the selected date range
            const filteredVideos = diretorio.videos.filter((video) => {
              const videoDate = new Date(video.created);
              return videoDate >= dataMin && videoDate <= dataMax;
            });

            // Return only directories that have matching videos
            return filteredVideos.length ? { ...diretorio, videos: filteredVideos } : null;
          })
          .filter(Boolean); // Remove empty directories (null values)

        console.log(this.listaDeVideosFiltrada);
      } else {
        this.listaDeVideosFiltrada = this.listaDeVideos;
      }
    }
  },
  methods: {
    playVideo(path, videoinfo) {
      this.selectedVideo = getVideoStreamUrl(path);
      this.videoInfo = videoinfo;
    },
  },
  mounted() {
    getVideoList()
      .then((response) => {
        this.listaDeVideos = response;
        this.listaDeVideosFiltrada = response;
      })
      .catch((error) => console.error('Erro ao buscar lista de vídeos:', error));
  },
};
</script>

<style lang="less">
.home {
  display: flex;
  flex-direction: column;
  padding: 2em;
  color: white;

  .header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items:center;
    gap: 1em;
    margin-bottom: 1em;
    h2 {
      margin: 0;
    }
    input {
      height: 2em;
      width: 12em;
    }
  }

  .video-player { 
  width: 100%;
  max-width: 50em;
  margin-bottom: 1em;
  gap: 0.5em; /* Adds spacing between elements */

  video {
    width: 100%;
    border-radius: 8px;
    grid-column: span 2; /* Makes video span both columns */
  }

  .info {
    margin-top: 0.5em;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
    justify-content: space-between;
    width: 100%;
  }
}

  .lista-videos {
    width: 20em;
    display: flex;
    flex-direction: column;
    gap: 1em;

    details {
      summary {
        cursor: pointer;
        padding: 1em;
        background: #333;
        border-radius: 0.5em;
        transition: background 0.3s ease;
      }

      summary:hover {
        background: #444;
      }
    }

    .video-line {
      padding: 0.5em 1em;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      grid-gap: 0.5em;
      background: #333;
      border-radius: 0.5em;
      padding: 1em;
      margin: 1em 0;
      a {
        color: #4dabf7;
        text-decoration: none;
        cursor: pointer;
        grid-column: span 2;

        &:hover {
          text-decoration: underline;
        }
      }

      small {
        color: #bbb;
        font-size: 0.9em;
      }
    }
  }
}
</style>
