foo:
  .name	"foo"
  call	$sub=:sub1
  .ret	


sub1:
  .sub	
  .name	"sub1"
  call	$sub=:sub2
  .ret	


sub2:
  .sub	
  .name	"sub2"
  notify	$txt="hello world"
  .ret