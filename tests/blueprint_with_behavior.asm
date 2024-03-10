bpBuilding1:
  .blueprint	f_building2x1a
  .name	"Bot Factory"
  .component	1, c_robotics_factory
  .component	2, c_robotics_factory
  .component	3, c_internal_storage
  .component	4, c_internal_storage
  .component	5, c_internal_storage
  .component	6, c_behavior, :fnBotFactory
  .link	13, 5
  .link	5, 12
  .link	3, 6
  .link	7, 11
  .link	15, 8
  .link	8, 14
  .link	3, 9
  .link	10, 11


fnBotFactory:
  .sub
  .name	"fnBotFactory"
  .pname	p1, "targetLocation"
  .pname	p2, "craft1"
  .pname	p3, "active1"
  .pname	p4, "craft2"
  .pname	p5, "active2"
  produce	$bp=:bpBot1
l0:
  compare_item	:l1, p3
  jump	:l3
l1:
l2:
  jump	:l0
l3:
  produce	$bp=:bpBot2
l4:
  compare_item	:l5, p3
  jump	:l7
l5:
l6:
  jump	:l4
l7:
  set_reg	f_bot_1m_a@1, p4
l8:
  compare_item	:l9, p5
  jump	:l11
l9:
l10:
  jump	:l8
l11:
  .ret


fnBot1:
  .sub
  .name	"fnBot1"
  notify	$txt="Hello World"
  .ret


bpBot1:
  .blueprint	f_bot_1m_a
  .name	"Example Bot 1"
  .logistics	"channel_1", false
  .logistics	"channel_2", true
  .logistics	"channel_3", false
  .logistics	"channel_4", true
  .component	1, c_power_transmitter
  .component	3, c_behavior, :fnBot1
  .reg	2, c_power_transmitter


bpBot2:
  .blueprint	f_bot_1m_c
  .name	"Example Bot 2"
  .disconnected
  .logistics	"transport_route", true
  .logistics	"carrier", false
  .logistics	"can_construction", false
  .component	1, c_medium_storage
  .component	2, c_modulespeed
  .component	3, c_behavior
  .lock	0, metalore
  .lock	1, metalbar
  .lock	2, true
  .lock	3, false
  .lock	5, true
  .lock	6, metalore