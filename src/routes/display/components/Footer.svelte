<script>
  export let total = 0;
</script>

<div id="footer">
  <div id="total-block">
    TOTAL
    <strong>{total}</strong>
  </div>
  <div id="join-block">
    Join with mobile
    <b>Scan QR to join</b>
  </div>
</div>

<style>
  #footer { position:absolute; bottom:26px; left:0; right:0; display:flex; justify-content:space-between; align-items:flex-end; padding:0 30px; pointer-events:none }
  #total-block { color: rgba(30,40,60,0.38); font-size:10px; letter-spacing:2px; text-transform:uppercase }
  #total-block strong { color: rgba(30,40,60,0.75); font-size:26px; font-weight:100; letter-spacing:6px; display:block; margin-top:2px }
  #join-block { text-align:right; color: rgba(30,40,60,0.35); font-size:10px; letter-spacing:2px; line-height:1.9 }
  #join-block b { color: rgba(30,40,60,0.65); font-size:13px; font-weight:400; display:block; letter-spacing:3px }
</style>
