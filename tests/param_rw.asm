foo:
  .name	"foo"
  .pname	p1, v
  .pname	p2, v2
  .pname	p3, v3
  .pname	p4, v4
  .pname	p5, v5
  notify	p1, $txt="hi"
  get_self	p2
  call	p3, p4, p5, $sub=:sub1
  .ret


sub1:
  .sub
  .name	"sub1"
  .pname	p1, v3
  .pname	p2, v4
  .pname	p3, v5
  call	p2, p1, $sub=:sub1_1
  call	p1, p3, $sub=:sub1_2
  .ret


sub1_1:
  .sub
  .name	"sub1_1"
  .pname	p1, v4
  .pname	p2, v3
  call	p2, p1, $sub=:sub2
  .ret


sub1_2:
  .sub
  .name	"sub1_2"
  .pname	p1, v3
  .pname	p2, v5
  call	p1, p2, $sub=:sub2
  .ret


sub2:
  .sub
  .name	"sub2"
  .pname	p1, v3
  .pname	p2, v4_5
  get_self	p1
  notify	p2
  .ret	