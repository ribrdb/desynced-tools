  jump v_letter_A
  .ret
retry:
  notify $txt="again"
  jump v_letter_A
  .ret

  label v_letter_A
  jump :retry