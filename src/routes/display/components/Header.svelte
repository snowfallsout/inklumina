<script>
  export let title = 'COLORFIELD';
  export let subtitle = 'Live Particle Canvas';
</script>

<header id="header">
  <h1>{title}</h1>
  <p>{subtitle}</p>
</header>

<style>
  #header { position:absolute; top:28px; left:50%; transform:translateX(-50%); text-align:center; pointer-events:none }
  #header h1 { color: rgba(30,40,60,0.85); font-size:30px; font-weight:100; letter-spacing:18px; text-transform:uppercase }
  #header p { color: rgba(30,40,60,0.38); font-size:10px; letter-spacing:5px; margin-top:6px; text-transform:uppercase }
</style>
