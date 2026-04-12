<script>
  export let mood = 'NEUTRAL';
  $: moodClass = mood;
</script>

<div id="emotion-badge" class={moodClass}>{mood}</div>

<style>
  #emotion-badge { position:absolute; top:28px; left:28px; color:rgba(30,40,60,0.28); font-size:10px; letter-spacing:2px; text-transform:uppercase; transition:color .5s }
  .SMILE { color: #B08800 }
  .SAD { color: #4169E1 }
</style>
