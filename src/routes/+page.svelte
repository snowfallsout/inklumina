<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  onMount(() => {
    // Redirect root to the existing display route
    goto('/display');
  });
</script>

<p>Redirecting to display…</p>
