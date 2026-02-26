const marketFormatter = (t2: any, marketJson: any) => {
  const finalDataArray: any = [];
      //  console.log(t2,marketJson,"GHJKlllllll")
  marketJson.event_data.market.map((ItemMarket: any) => {
    const eventMarket: any = {
      MarketName: ItemMarket.MarketName,
      Runners: [],
    };
    // console.log(ItemMarket,"GHJK")
    ItemMarket.Runners.map((ItemRunner: any) => {
      if (marketJson.slug !== "worliinstant" && marketJson.slug !==  "Superover" && marketJson.slug !== "fivewicket") {
        console.log(t2)
        t2.filter(
          ({ sid, sectionId, tsection,i}: any) =>
            (sid || sectionId || tsection || i) == ItemRunner.SelectionId
        ).map((card: any) => {
          if (card) {
            if (card.rate) card.b1 = card.rate;
            card.runnerName = card.nation || card.nat;
            if (marketJson.slug === "race2020") {
              if (card.sid == "6") {
                card.bs1 = 90;
                card.ls1 = 105;
              }
              if (card.sid == "5") {
                card.bs1 = 100;
                card.ls1 = 100;
              }
            }
            eventMarket.Runners.push(card);
          }
        });
      }
      // console.log(marketJson.slug)
    if (marketJson.slug === "Superover" || marketJson.slug === "fivewicket") {
    t2.forEach((item: any) => {
      item.section
        ?.filter(
          ({ sid, sectionId, tsection, i }: any) =>
            (sid || sectionId || tsection || i) ==
            ItemRunner.SelectionId
        )
        .map((card: any) => {
          console.log(card,"fghjkiol")
          if (!card) return;

          if (card.rate) card.b1 = card.rate;
          card.runnerName = card.nation || card.nat;
          card.status = card.gstatus;
          card.b1 = card.odds[0].odds;
          card.l1 = card.odds[1].odds;
          card.bs1 = card.odds[0].size;
           card.ls1 = card.odds[1].size;
           card.gtype = marketJson.slug == "Superover" ? "superover":"cricketv3"
           card.sid = card.sid

          eventMarket.Runners.push(card);
        });
    });
  }

      if (
        (marketJson.slug === "worliinstant" ||
          marketJson.slug === "worlimatka") &&
        t2 &&
        t2.length > 0
      ) {
        eventMarket.Runners.push({
          ...ItemRunner,
          mid: t2[0].mid,
          gstatus: t2[0].gstatus,
          sid: ItemRunner.SelectionId,
        });
      }
    });
    finalDataArray.push(eventMarket);
  });

  return finalDataArray;
};

function getParameters(url: string) {
  const urlArray = url.split("?");
  const searchParams = new URLSearchParams(urlArray[1]);
  const paramsArray = [];

  for (const [key, value] of searchParams.entries()) {
    paramsArray.push({ key, value });
  }
  return paramsArray;
}

export { marketFormatter, getParameters };
