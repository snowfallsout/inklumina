<script>
  import Display from './views/Display.svelte';
  import Mobile from './views/Mobile.svelte';

  const isMobile = location.pathname.startsWith('/join');
</script>

<svelte:component this={isMobile ? Mobile : Display} />
