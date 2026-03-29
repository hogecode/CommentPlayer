
### /api/v1/syobocal [post]


#### フェーズ1

- リクエストボディはTID、タイトル名(今まで通り)、そしてシリーズIDから取得したidも含める
- レスポンスはそのままでいい
- そのあと、GET http://cal.syoboi.jp/db?Command=TitleLookup&TID={number}にGo側でアクセス
- 外部APIのレスポンスは以下の形式である

```xml
<TitleLookupResponse>
<Result>
<Code>200</Code>
<Message/>
</Result>
<TitleItems>
<TitleItem id="1853">
<TID>1853</TID>
<LastUpdate>2015-02-20 10:56:00</LastUpdate>
<Title>ハートキャッチプリキュア！</Title>
<ShortTitle/>
<TitleYomi>はーときゃっちぷりきゅあ</TitleYomi>
<TitleEN>HEARTCATCH PRECURE!</TitleEN>
<Comment>*リンク -[[ABCテレビ http://asahi.co.jp/heartcatch_precure/]] -[[東映アニメーション http://www.toei-anim.co.jp/tv/hc_precure/]] -[[TOKYO MX http://www.mxtv.co.jp/hc_precure/]] -[[BS11 http://www.bs11.jp/anime/2318/]] -[[マーベラス http://www.marv.jp/special/hc_precure/]] -[[プリキュアガーデン http://www.precure-garden.com/]] *メモ -16:9ハイビジョン解像度 *スタッフ :原作:東堂いづみ :掲載誌:なかよし(講談社)、たのしい幼稚園、おともだち、他 :企画:西出将之(ABC)、松下洋子(ADK)、関弘美(東映アニメーション) :プロデューサー:吉田健一郎(ABC)、鶴崎りか(ADK)、梅澤淳稔(東映アニメーション) :シリーズディレクター:長峯達也 :シリーズ構成:山田隆司 :キャラクターデザイン:馬越嘉彦 :美術デザイン:増田竜太郎 :音楽:高梨康治 :色彩設計:佐久間ヨシ子 :製作担当:額賀康彦 :アニメーション制作:東映アニメーション :制作:ABC、ADK、東映アニメーション *オープニングテーマ「Alright! ハートキャッチプリキュア！」 :作詞:六ツ見純代 :作曲:高取ヒデアキ :編曲:籠島裕昌 :歌:池田彩 *エンディングテーマ1「ハートキャッチ☆パラダイス！」 :作詞:六ツ見純代 :作曲:marhy :編曲:久保田光太郎 :歌:工藤真由 :使用話数:#1～#24 *エンディングテーマ2「Tomorrow song ～あしたのうた～」 :作詞:六ツ見純代 :作曲:高取ヒデアキ :編曲:籠島裕昌 :歌:工藤真由 :使用話数:#25～#49 *挿入歌「つ.ぼ.み ～Future Flower～」 :作詞:六ツ見純代 :作曲:高梨康治 :編曲:水谷広実 :歌:花咲つぼみ／キュアブロッサム(水樹奈々) :使用話数:#4、#24、#25 *挿入歌「スペシャル*カラフル」 :作詞:六ツ見純代 :作曲:高梨康治 :編曲:藤澤健至 :歌:来海えりか／キュアマリン(水沢史絵) :使用話数:#8、#19 *挿入歌「MOON～月光～ATTACK」 :作詞:六ツ見純代 :作曲:高梨康治 :編曲:藤澤健至 :歌:月影ゆり／キュアムーンライト(久川綾) :使用話数:#35、#47 *挿入歌「HEART GOES ON」 :作詞:青木久美子 :作曲:高取ヒデアキ :編曲:籠島裕昌 :歌:工藤真由、池田彩 :使用話数:#36、#38、#48 *挿入歌「Power of Shine」 :作詞:六ツ見純代 :作曲:高梨康治 :編曲:藤澤健至 :歌:明堂院いつき／キュアサンシャイン(桑島法子) :使用話数:#46 *キャスト :花咲つぼみ／キュアブロッサム:水樹奈々 :来海えりか／キュアマリン:水沢史絵 :明堂院いつき／キュアサンシャイン:桑島法子 :月影ゆり／キュアムーンライト:久川綾 :シプレ:川田妙子 :コフレ:くまいもとこ :ポプリ:菊池こころ :コロン:石田彰 :花咲薫子／キュアフラワー:坂本千夏 :花咲陽一:金光宣明 :花咲みずき:加藤優子 :来海ももか:伊藤静 :来海流之助:遠近孝一 :来海さくら:氷青 :明堂院厳太郎:中博史 :明道院つばき:湯屋敦子 :明道院さつき:前野智昭 :沢井なおみ:埴岡由紀子 :黒田るみこ:足立友 :佐久間としこ:吉田聖子 :志久ななみ:藤井ゆきよ :上島さやか:渡辺明乃 :小笠原まお:久嶋志帆 :三浦あきら:木内レイコ :多田かなえ:小島幸子 :酒井まさと:長沢美樹 :高岸あずさ:折笠富美子 :番ケンジ:置鮎龍太郎 :水島アヤ:白石涼子 :砂漠王デューン:緑川光 :サバーク博士:楠大典 :ダークプリキュア:高山みなみ :サソリーナ:高乃麗 :クモジャキー:竹本英史 :コブラージャ:野島裕史 :デザトリアン:金田朋子 :スナッキー:堀井茶渡、岩崎了</Comment>
<Cat>10</Cat>
<TitleFlag>0</TitleFlag>
<FirstYear>2010</FirstYear>
<FirstMonth>2</FirstMonth>
<FirstEndYear>2011</FirstEndYear>
<FirstEndMonth>1</FirstEndMonth>
<FirstCh>ABCテレビ、テレビ朝日</FirstCh>
<Keywords>プリキュア</Keywords>
<UserPoint>55</UserPoint>
<UserPointRank>2648</UserPointRank>
<SubTitles>*01*私、変わります！変わってみせます!! *02*私って史上最弱のプリキュアですか?? *03*2人目のプリキュアはやる気まんまんです！ *04*早くもプリキュアコンビ解散ですか？ *05*拒否されたラーメン！親子の絆なおします！ *06*スクープ！プリキュアの正体ばれちゃいます!? *07*あこがれの生徒会長！乙女心はかくせません!! *08*カリスマモデルのため息！って、なぜですか？ *09*スカウトされたお父さん！お花屋さんをやめちゃいます!? *10*最大のピンチ！ダークプリキュアが現れました！ </SubTitles>
</TitleItem>
</TitleItems>
</TitleLookupResponse>
```

**DB構造**
```sql
CREATE TABLE `series` (
    `id` integer PRIMARY KEY AUTOINCREMENT,
    `series_name_file` text, -- 変更しない
    `syobocal_title_id` integer, -- XML リクエストのTID
    `syobocal_title_name` text, -- XML Title
    `syobocal_title_name_en` text, -- XML TitleEN
    `comment` text, -- XML Comment →現在TEXT形式なのでJSONにテーブル構造を変更
    `first_year` integer, -- XML FirstYear
    `first_month` integer, -- XML FirstMonth
    `first_end_year` integer, -- XML FirstEndYear
    `first_end_month` integer, -- XML FirstEndMonth
    `subtitles` text, -- XML SubTitles →現在TEXT形式なのでJSONにテーブル構造を変更
    `created_at` datetime,
    `updated_at` datetime
)
```

現在は新しいレコードを追加する処理になっているが、取得した値を使って、UPDATEでseries idに該当する行を更新する。
変更する値は、各列の右にコメントで記している。

また、comment subtitlesは現在構造化されていないので、*と-を頼りにして、JSONとして構造化するように変更。DBテーブルもtextからjsonにする。


#### フェーズ2

**APIリクエストの動作の続き**

先ほど、しょぼいカレンダーのTIDとシリーズテーブルのIDを受け取るリクエストが来た。
その後、しょぼいカレンダーに以下のリクエストを送る。
このクエリやDTOは既にinternal/syobocal内で実装してある。
http://cal.syoboi.jp/db?Command=ProgLookup&TID={number}&JOIN=SubTitles

レスポンスは以下の形式。
```xml
<ProgLookupResponse>
<ProgItems>
<ProgItem id="157950">
<LastUpdate>2010-01-06 10:48:07</LastUpdate>
<PID>157950</PID>
<TID>1853</TID>
<StTime>2010-02-07 08:30:00</StTime>
<StOffset>0</StOffset>
<EdTime>2010-02-07 09:00:00</EdTime>
<Count>1</Count>
<SubTitle/>
<ProgComment/>
<Flag>2</Flag>
<Deleted>0</Deleted>
<Warn>1</Warn>
<ChID>67</ChID>
<Revision>0</Revision>
<STSubTitle>私、変わります！変わってみせます!!</STSubTitle>
</ProgItem>
<ProgItem id="157951">
<LastUpdate>2010-01-06 10:48:07</LastUpdate>
<PID>157951</PID>
<TID>1853</TID>
<StTime>2010-02-14 08:30:00</StTime>
<StOffset>0</StOffset>
<EdTime>2010-02-14 09:00:00</EdTime>
<Count>2</Count>
<SubTitle/>
<ProgComment/>
<Flag>0</Flag>
<Deleted>0</Deleted>
<Warn>0</Warn>
<ChID>67</ChID>
<Revision>0</Revision>
<STSubTitle>私って史上最弱のプリキュアですか??</STSubTitle>
</ProgItem>
```

ProgItemは配列だが、videoテーブルレコードのうち、series_id=req.シリーズIDのレコードを対象に以下のようなUPDATE文を実行する。
```sql
update video description=progitem.stsubtitle, channel_id=progitem.chid,
       prog_start_time=progitem.sttime, prog_end_time=progitem.edtime
       where episode=progitem.count
```

ビデオテーブルの形式は以下。
prog_start_time, prog_end_timeカラムは新たにGORMエンティティに追加する。

```sql
CREATE TABLE `video` (
    `id` integer PRIMARY KEY AUTOINCREMENT,
    `file_name` text,
    `folder_path` text,
    `file_path` text,
    `status` text,
    `file_hash` text,
    `file_size` integer,
    `jikkyo_comment_count` integer,
    `jikkyo_date` datetime,
    `views` integer,
    `liked` numeric,
    `screenshot_file_path` text,
    `duration` real,
    `thumbnail_info_json` json,
    `created_at` datetime,
    `updated_at` datetime,
    `folder_id` integer,
    `description` text, --series.comment
    `is_deleted` numeric,
    `series_id` integer,
    `episode` integer, --
    `subtitle` text --
)
```

これがvideoテーブルである。
