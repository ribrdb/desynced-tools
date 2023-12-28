  set_reg v_letter_A@1, A
  jump A
  
  label v_letter_A
  notify $txt="0"
  exit

  label v_letter_A@1
  notify $txt="1"
  exit