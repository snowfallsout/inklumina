<script>
  import { toast } from '$lib/stores/ui.js';
</script>

{#if $toast}
  <div class="toast-wrap"><div class="toast-pill">{$toast.msg}</div></div>
{/if}

<style>
  .toast-wrap { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none }
  .toast-pill { display:inline-block; padding:10px 28px; border-radius:50px; background:linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25)); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.6); box-shadow:0 4px 16px rgba(31,38,135,0.08); color:#333 }
</style>
