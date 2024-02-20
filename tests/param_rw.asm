foo:
  .name	"foo"
  .pname	p1, v
  .pname	p2, v2
  notify	p1, $txt="hi"
  get_self	p2
  .ret	