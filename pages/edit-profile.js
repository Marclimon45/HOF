// In the JSX part of the component:
<div className={styles.formSection}>
  <h2>Redeem Code</h2>
  <div className={styles.redeemContainer}>
    <input
      type="text"
      value={redeemCode}
      onChange={(e) => setRedeemCode(e.target.value)}
      placeholder="Enter redeem code"
      className={styles.redeemInput}
    />
    <button
      onClick={handleRedeemCode}
      className={styles.redeemButton}
      disabled={!user}
    >
      Redeem
    </button>
  </div>
</div> 