// 游戏剧本：基于 miaoda-game-scenario-core 脚本 DSL
// 自定义命令: say / bg / show / hide / bgm / mark / ending
// mark 为存档检查点标记，每个阻塞语句前都有 label + mark
// 变量: trust(信任) courage(勇气) —— 分支选择累积，决定结局走向

export const SCRIPT = `
label start

# ── 第一章 · 黄昏的教室 ──
label c001
bg classroom_sunset
bgm daily
show yukino_smile center
mark c001
say 旁白 「四月。樱花的花瓣贴在玻璃窗上，放学后的教室被夕阳染成蜂蜜色。」

label c002
mark c002
say 旁白 「我磨磨蹭蹭地收拾着书包。今天的值日，又只剩下我们两个人。」

label c003
mark c003
say 雪乃 「莲，这边擦完了哦。……呐，你在看窗外对吧。樱花，已经开了七分了呢。」

label c004
mark c004
say 莲 「嗯。说起来，河岸边那条樱花隧道，今年好像会点灯。」

label c005
mark c005
say 旁白 「雪乃的手指停在黑板上。她回过头，眼睛亮得像落进了星星。」

label c006
mark c006
say 雪乃 「夜樱！……莲，你还记得啊。小时候的约定。」

label c007
mark c007
say 雪乃 「『毕业之前，要一起去看一次夜樱』——拉过勾的。我可是一直记着哦。」

label c008
mark c008
say 旁白 「她笑着，忽然弯下腰咳嗽起来。那咳嗽声比想象中要深、要长。」

label c009
mark c009
say 旁白 「夕阳里，她的侧脸白得几乎透明。我的心，没来由地沉了一下。」

label c010
mark c010
choice "「雪乃，你的身体……真的没事吗？」" -> ch1_press
choice "「走吧，天要黑了。」把疑问咽了回去" -> ch1_swallow

label ch1_press
set trust = trust + 1
bgm sorrow
show yukino_sad center
label c010a
mark c010a
say 雪乃 「……诶？」
label c011
mark c011
say 旁白 「她的笑容晃了一下，像被风吹皱的水面。只一瞬间。」

label c012
mark c012
say 雪乃 「只是感冒啦，感冒。春天不是容易感冒嘛。……莲，你什么时候变得这么爱操心了？」

label c013
mark c013
say 旁白 「她转过身去收拾讲台。我看着她的背影，那句话没能再追问下去。」
goto c020

label ch1_swallow
label c010b
mark c010b
say 雪乃 「嗯……走吧。」
label c014
mark c014
say 旁白 「她轻轻应了一声。那一瞬间，我似乎看见她松了口气——又好像，有一点点失望。」

label c015
mark c015
say 旁白 「走廊尽头的窗开着。樱花瓣飘进来，落在她刚刚擦过的黑板上。」

label c020
mark c020
say 旁白 「那时的我还不知道，这个春天，是我们倒数第二个春天。」

# ── 第二章 · 樱花道上 ──
label c021
bg sakura_road
bgm daily
show yukino_smile center
mark c021
say 旁白 「周末。约好一起去旧书店的路，要穿过河岸的樱花道。」

label c022
mark c022
say 雪乃 「哇……莲，快看！风一吹，就像在下雪一样。」

label c023
mark c023
say 旁白 「她伸手接住一片花瓣，小心翼翼地摊在掌心，像捧着什么易碎的东西。」

label c024
mark c024
say 雪乃 「樱花啊，开得最盛的时候就开始落了。你不觉得，这很像它故意的吗？」

label c025
mark c025
say 莲 「故意？」

label c026
mark c026
say 雪乃 「嗯。故意在最漂亮的时候告别，这样大家就永远记得它最漂亮的样子了。」

label c027
mark c027
say 旁白 「她笑着说这句话。笑容背后有什么东西一闪而过，快得让我以为是错觉。」

label c028
mark c028
say 旁白 「下一秒，她扶住了路边的栏杆。身体，缓缓地滑了下去。」

label c029
bgm sorrow
mark c029
say 莲 「雪乃——！」

label c030
mark c030
say 旁白 「我冲过去扶住她。她的口袋翻开了，一个白色的小药瓶滚落在花瓣里。」

label c031
mark c031
say 旁白 「药瓶的标签上，印着一行我看不懂的药名，和——『东京慈明会医院』。」

label c032
mark c032
say 旁白 「雪乃的睫毛颤了颤，缓缓睁开眼。她的目光，落在了我手边的药瓶上。」

label c033
mark c033
choice "捡起药瓶，认真地看着她：「告诉我，到底怎么了。」" -> ch2_press
choice "趁她还没完全清醒，把药瓶悄悄放回她的口袋" -> ch2_hide

label ch2_press
set trust = trust + 1
show yukino_sad center
label c033a
mark c033a
say 雪乃 「…………你看到了啊。」
label c034
mark c034
say 旁白 「她撑着我的手臂坐起来。樱花落在她的头发上，她没有去拂。」

label c035
mark c035
say 雪乃 「莲，求你。现在……现在还不行。再给我一点时间，好不好？」

label c036
mark c036
say 旁白 「她的指尖冰凉，轻轻攥住我的袖口。那双总是笑着的眼睛里，第一次有了近乎哀求的神色。」

label c037
mark c037
say 莲 「……好。但是雪乃，别一个人扛着。」

label c038
mark c038
say 旁白 「她低下头，很轻、很轻地「嗯」了一声。轻得像一句叹息。」
goto c045

label ch2_hide
label c033b
mark c033b
say 旁白 「我把药瓶塞回她的口袋。心跳得厉害，却装作什么都没看见。」
label c039
mark c039
say 雪乃 「……嗯？我怎么……哎呀，真是的，蹲久了头晕而已啦。」

label c040
mark c040
say 旁白 「她醒来的瞬间摸了摸口袋，然后——用我听得见的音量，极轻地说了一句。」

label c041
mark c041
say 雪乃 「……谢谢。」

label c042
mark c042
say 旁白 「那声「谢谢」，听起来为什么那么像「对不起」呢。」

label c045
mark c045
say 旁白 「回去的路上，我们谁都没有说话。樱花还在落，落在她微微发抖的肩上。」

# ── 第三章 · 天台的真相 ──
label recall_rooftop
event rooftop_twilight
label c046
bg rooftop_sunset
bgm sorrow
show misaki center
mark c046
say 旁白 「第二天午休。班长相泽美咲把我叫到了天台。风很大，她的表情比风更冷。」

label c047
mark c047
say 美咲 「高崎。关于雪乃的事——我有话必须跟你说。」

label c048
mark c048
say 旁白 「美咲是雪乃最好的朋友。她盯着我，像在确认我有没有资格听接下来的话。」

label c049
mark c049
if trust >= 1
say 美咲 「你那天在樱花道，看到她晕倒了吧。……她拜托我保密，可我看不下去了。」
endif
if trust < 1
say 美咲 「昨天，在樱花道上——她晕倒了对吧。而你，什么都没问。」
endif

label c050
mark c050
say 美咲 「雪乃她……心脏有病。先天性的。医生说，照现在的恶化速度，撑不过今年夏天。」

label c051
mark c051
say 旁白 「天台的风声忽然变得很远。铁丝网外的夕阳，红得像烧起来的信纸。」

label c052
mark c052
if trust >= 1
say 美咲 「她瞒着你，是因为不想看你难过。她说——『莲的前途才刚刚要开始啊』。」
endif
if trust < 1
say 美咲 「下周她就要转去东京的医院了。她谁都不告诉，尤其是你。……你明白为什么吗？」
endif

label c053
mark c053
say 旁白 「我的喉咙发紧。小时候拉过勾的约定、她苍白的脸、药瓶上的医院名，全都连了起来。」

label c054
mark c054
choice "「她在哪？我要去问她本人！」转身冲向楼梯" -> ch3_go
choice "「……让我想想。」在原地站住" -> ch3_wait

label ch3_go
set courage = courage + 1
label c054a
mark c054a
say 美咲 「……哼，总算像个样子了。去吧。她现在应该在图书馆。」
label c055
mark c055
say 旁白 「美咲的声音从背后追过来：「高崎——别再装作看不见了！」」
goto c060

label ch3_wait
label c054b
mark c054b
say 美咲 「……想？高崎，你知不知道，有些事情是没有时间让你慢慢想的。」
label c056
mark c056
say 旁白 「美咲丢下这句话，头也不回地走了。天台上只剩下我，和烧得通红的云。」

# ── 第四章 · 分歧 ──
label c060
mark c060
if trust >= 1
goto hospital_route
endif
goto rain_route

# ── 路线A · 病房 ──
label hospital_route
label recall_hospital
event hospital_confession
bg hospital_room
bgm quiet
hide misaki
show yukino_sad center
mark c060
say 旁白 「第二天是探视日。我打听到了病房。白色的房间里，消毒水的气味淡得像雾。」

label c061
mark c061
say 雪乃 「……莲？你怎么……知道这里……」

label c062
mark c062
say 旁白 「她慌忙把手背上的输液针往被子里藏。那个动作，让我的心狠狠抽了一下。」

label c063
mark c063
say 莲 「对不起。我都知道了。……对不起，让你一个人瞒了这么久。」

label c064
mark c064
say 旁白 「雪乃沉默了很久。窗外的光落在她脸上，她的睫毛湿了。」

label c065
mark c065
say 雪乃 「我不想让你看到我现在的样子。我希望莲记住的，永远是樱花道上笑着的我。」

label c066
mark c066
say 雪乃 「可是……好过分啊。越是这样想，就越想见你。想见你，又怕见你。」

label c067
mark c067
show yukino_crying center
say 旁白 「她哭了。认识十几年，我第一次看到她哭。原来她一直在笑，是因为一直在忍。」

label c068
mark c068
say 雪乃 「我啊，有一个遗憾。……夜樱。说好要一起看的夜樱。医生说，我不能离开医院。」

label c069
mark c069
choice "「那我们现在就去。」向她伸出手" -> ch4_break
choice "「好好治病。等病好了，去看多少次都可以。」" -> ch4_stay

label ch4_break
set courage = courage + 1
label c069a
mark c069a
say 雪乃 「诶……？可是，医院……」
label c070
mark c070
say 莲 「就一个小时。我向护士求了情，披件外套就回来。——拉过勾的约定，我想让它算数。」

label c071
mark c071
say 旁白 「她看着我伸出的手，眼泪掉在被子上，晕开一小片深色。然后，她笑了。」

label c072
mark c072
say 雪乃 「……嗯。莲，你还是老样子。决定的事情，十头牛都拉不回来。」
goto final_check

label ch4_stay
label c069b
mark c069b
say 雪乃 「…………嗯。你说得对。」
label c073
mark c073
say 旁白 「她笑着点头。可那一瞬间，她眼睛里的光，像被风吹过的烛火一样，暗了一暗。」

label c074
mark c074
say 旁白 「后来我无数次地想：如果那天我拉住了她的手——但那时的我，还以为自己做了正确的选择。」
goto final_check

# ── 路线B · 雨夜的错过 ──
label rain_route
label recall_rain
event rain_question
bg rain_street
bgm sorrow
hide yukino
show misaki center
mark c060
say 旁白 「我犹豫了三天。第三天放学，雨下得很大。美咲撑着伞，站在校门口等我。」

label c075
mark c075
say 美咲 「不用去了。雪乃今天已经转院去东京了。……她走之前，连你的联系方式都没敢留。」

label c076
mark c076
say 旁白 「雨点砸在伞面上。美咲的声音隔着雨幕，听不真切。」

label c077
mark c077
say 美咲 「她说，『就这样悄悄消失的话，莲会难过一阵子，但总会好起来的』。……你也这么想吗？」

label c078
mark c078
say 旁白 「我答不上来。雨水顺着我的头发流进眼睛。原来错过了，就是错过了。」

label final_check
mark c080
if trust >= 2
if courage >= 2
goto ed3_route
endif
endif
if trust >= 1
goto ed2_route
endif
goto ed1_route

# ── 结局壹 · 未送出的信 ──
label ed1_route
bg classroom_sunset
bgm sorrow
hide yukino
hide misaki
mark c081
say 旁白 「六月。雪乃的座位被撤掉了。没有人告诉我她的消息，我也没有勇气去打听。」

label c082
mark c082
say 旁白 「七月末的一个黄昏，美咲出现在空教室里。她的眼睛很红，手里拿着一封信。」

label c083
bgm quiet
mark c083
say 美咲 「……雪乃走了。上周。这是她留给你的。她说，一定要等毕业以后才能给你。」

label c084
mark c084
say 旁白 「信封很薄。可我捏着它，像捏着一块烧红的铁。教室里安静得能听见灰尘落下。」

label c085
mark c085
say 旁白 「『莲，对不起，一直瞒着你。其实我有好多话想对你说——』」

label c086
mark c086
say 旁白 「『河岸的夜樱，对不起，我要失约了。还有，其实我一直，一直都想告诉你——』」

label c087
mark c087
say 旁白 「信就到这里。最后半句的墨迹洇开了，再也看不出原本想写的是什么。」

label c088
mark c088
say 旁白 「我把信按在胸口，在空无一人的教室里，终于哭出了声。」

ending ed1
exit

# ── 结局贰 · 夜樱下的告别 ──
label ed2_route
label recall_night_sakura
event night_sakura_oath
bg night_sakura
bgm sorrow
hide misaki
show yukino_smile center
mark c090
say 旁白 「五月的最后一个夜晚。我向医生求了很久，得到了一个小时的许可。」

label c091
mark c091
say 旁白 「河岸的樱花隧道点起了灯笼。夜风一过，满树的粉色在灯光里簌簌地落。」

label c092
mark c092
say 雪乃 「哇……莲，你看。白天看是雪，晚上看——是星星呢。」

label c093
mark c093
say 旁白 「她披着厚厚的外套，仰着头。灯笼的光落在她脸上，那是我见过的、她最美的样子。」

label c094
mark c094
say 雪乃 「莲，谢谢你。……其实啊，我早就不害怕了。真的。」

label c095
mark c095
say 雪乃 「樱花在最漂亮的时候告别，是为了让大家永远记得它。……我也是哦。」

label c096
mark c096
say 旁白 「她靠在我的肩上。体温很薄，薄得像一片花瓣。」

label c097
mark c097
say 雪乃 「呐，莲。明年的樱花，后年的樱花，以后的每一年……你都要替我好好看着。」

label c098
mark c098
say 雪乃 「别忘了……春天的味道……」

label c099
mark c099
say 旁白 「她的声音越来越小，最后融进了夜风里。灯笼一盏、一盏地熄了。」

label c100
mark c100
say 旁白 「那一晚的樱花落尽了。而我学会了——有些告别，是为了被永远记住。」

ending ed2
exit

# ── 结局叁 · 樱花再开之时 ──
label ed3_route
bg night_sakura
bgm hope
hide misaki
show yukino_smile center
mark c110
say 旁白 「我牵着她的手，从医院的侧门溜出来。夜风很凉，她的手很暖——是攥得太用力了。」

label c111
mark c111
say 旁白 「河岸的樱花隧道亮起灯笼。她仰起头，整个人都浸在粉色的光里。」

label c112
mark c112
say 雪乃 「好漂亮……原来夜樱，是这个样子的。亮得像——像春天专门为夜晚点的一千盏灯。」

label c113
mark c113
say 莲 「雪乃。还有一个约定，现在补上。」

label c114
mark c114
say 旁白 「我伸出小指。她愣了一下，随即笑着伸出自己的。两只小指勾在一起，微微发抖。」

label c115
mark c115
say 莲 「『活下去。明年的夜樱，后年的，十年后的——都要一起来看。』」

label c116
mark c116
show yukino_crying center
say 旁白 「她望着我，眼泪大颗大颗地掉下来，却笑得比灯笼还亮。」

label c117
mark c117
say 雪乃 「嗯！拉勾上吊，一百年不许变。……莲，我决定了。我要接受那个手术。」

label c118
mark c118
say 雪乃 「成功率只有三成。但是——约好的事情，我想活着做到。」

label c119
bg sakura_road
mark c119
say 旁白 「手术前一晚，她给我发消息：『今天在病房里种了一小枝樱花。等我好了，把它还给河岸。』」

label c120
mark c120
say 旁白 「一年后的春天。一封盖着疗养院邮戳的信，和一枝压干的樱花，一起寄到了我家。」

label c121
bgm daily
mark c121
say 旁白 「『手术成功了。医生说恢复得很好。明年的春天——不，从今往后的每一个春天，一起去看樱花吧。』」

ending ed3
exit
`;
