using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;

#nullable disable

namespace BaseCore.Repository.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(SqlServerDbContext))]
    [Migration("20260527161000_SeedPremierLeagueRoundsAndMatches")]
    public partial class SeedPremierLeagueRoundsAndMatches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DECLARE @SeasonId int;
DECLARE @FallbackStadiumId int;

IF NOT EXISTS (SELECT 1 FROM [Seasons] WHERE [Name] = N'2026-2027')
BEGIN
    INSERT INTO [Seasons] ([Name], [StartDate], [EndDate], [IsActive], [CreatedAt], [UpdatedAt])
    VALUES (N'2026-2027', '2026-08-01', '2027-05-31', 1, '2026-01-01', NULL);
END;

SELECT @SeasonId = [Id] FROM [Seasons] WHERE [Name] = N'2026-2027';
SELECT TOP (1) @FallbackStadiumId = [Id] FROM [Stadiums] ORDER BY [Id];

DECLARE @Rounds table
(
    [RoundNumber] int NOT NULL PRIMARY KEY,
    [Name] nvarchar(80) NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL
);

INSERT INTO @Rounds ([RoundNumber], [Name], [StartDate], [EndDate])
VALUES
    (1, N'Vòng 1', '2026-08-15', '2026-08-17'),
    (2, N'Vòng 2', '2026-08-22', '2026-08-24'),
    (3, N'Vòng 3', '2026-08-29', '2026-08-31'),
    (4, N'Vòng 4', '2026-09-05', '2026-09-07'),
    (5, N'Vòng 5', '2026-09-12', '2026-09-14');

INSERT INTO [MatchRounds] ([SeasonId], [RoundNumber], [Name], [StartDate], [EndDate], [CreatedAt], [UpdatedAt])
SELECT @SeasonId, r.[RoundNumber], r.[Name], r.[StartDate], r.[EndDate], '2026-01-01', NULL
FROM @Rounds r
WHERE NOT EXISTS
(
    SELECT 1
    FROM [MatchRounds] existing
    WHERE existing.[SeasonId] = @SeasonId
      AND existing.[RoundNumber] = r.[RoundNumber]
);

UPDATE existing
SET [Name] = r.[Name],
    [StartDate] = r.[StartDate],
    [EndDate] = r.[EndDate],
    [UpdatedAt] = SYSUTCDATETIME()
FROM [MatchRounds] existing
INNER JOIN @Rounds r ON r.[RoundNumber] = existing.[RoundNumber]
WHERE existing.[SeasonId] = @SeasonId;

DECLARE @StadiumMap table
(
    [ClubName] nvarchar(120) NOT NULL PRIMARY KEY,
    [StadiumName] nvarchar(160) NOT NULL
);

INSERT INTO @StadiumMap ([ClubName], [StadiumName])
VALUES
    (N'Manchester United', N'Old Trafford'),
    (N'Liverpool', N'Anfield'),
    (N'Arsenal', N'Emirates Stadium'),
    (N'Chelsea', N'Stamford Bridge'),
    (N'Manchester City', N'Etihad Stadium'),
    (N'Tottenham Hotspur', N'Tottenham Hotspur Stadium'),
    (N'AFC Bournemouth', N'Vitality Stadium'),
    (N'Aston Villa', N'Villa Park'),
    (N'Brentford', N'Gtech Community Stadium'),
    (N'Brighton & Hove Albion', N'American Express Stadium'),
    (N'Burnley', N'Turf Moor'),
    (N'Crystal Palace', N'Selhurst Park'),
    (N'Everton', N'Hill Dickinson Stadium'),
    (N'Fulham', N'Craven Cottage'),
    (N'Leeds United', N'Elland Road'),
    (N'Newcastle United', N'St James'' Park'),
    (N'Nottingham Forest', N'The City Ground'),
    (N'Sunderland', N'Stadium of Light'),
    (N'West Ham United', N'London Stadium'),
    (N'Wolverhampton Wanderers', N'Molineux Stadium');

DECLARE @Fixtures table
(
    [RoundNumber] int NOT NULL,
    [SlotNumber] int NOT NULL,
    [HomeName] nvarchar(120) NOT NULL,
    [AwayName] nvarchar(120) NOT NULL,
    [Slug] nvarchar(160) NOT NULL,
    [KickoffTime] datetime2 NOT NULL,
    [IsFeatured] bit NOT NULL
);

INSERT INTO @Fixtures ([RoundNumber], [SlotNumber], [HomeName], [AwayName], [Slug], [KickoffTime], [IsFeatured])
VALUES
    (1, 1, N'Manchester United', N'Liverpool', N'manchester-united-vs-liverpool-round-1', '2026-08-15T18:30:00', 1),
    (1, 2, N'Arsenal', N'Chelsea', N'arsenal-vs-chelsea-round-1', '2026-08-15T21:00:00', 0),
    (1, 3, N'Manchester City', N'Tottenham Hotspur', N'manchester-city-vs-tottenham-hotspur-round-1', '2026-08-16T16:00:00', 0),
    (1, 4, N'Aston Villa', N'Newcastle United', N'aston-villa-vs-newcastle-united-round-1', '2026-08-16T18:30:00', 0),
    (1, 5, N'Brighton & Hove Albion', N'West Ham United', N'brighton-hove-albion-vs-west-ham-united-round-1', '2026-08-16T21:00:00', 0),
    (1, 6, N'Brentford', N'Crystal Palace', N'brentford-vs-crystal-palace-round-1', '2026-08-17T01:00:00', 0),
    (1, 7, N'Everton', N'Leeds United', N'everton-vs-leeds-united-round-1', '2026-08-17T18:30:00', 0),
    (1, 8, N'Fulham', N'Nottingham Forest', N'fulham-vs-nottingham-forest-round-1', '2026-08-17T21:00:00', 0),
    (1, 9, N'Burnley', N'Sunderland', N'burnley-vs-sunderland-round-1', '2026-08-18T00:30:00', 0),
    (1, 10, N'AFC Bournemouth', N'Wolverhampton Wanderers', N'afc-bournemouth-vs-wolverhampton-wanderers-round-1', '2026-08-18T03:00:00', 0),

    (2, 1, N'Chelsea', N'Manchester City', N'chelsea-vs-manchester-city-round-2', '2026-08-22T18:30:00', 1),
    (2, 2, N'Liverpool', N'Arsenal', N'liverpool-vs-arsenal-round-2', '2026-08-22T21:00:00', 0),
    (2, 3, N'Tottenham Hotspur', N'Manchester United', N'tottenham-hotspur-vs-manchester-united-round-2', '2026-08-23T16:00:00', 0),
    (2, 4, N'Newcastle United', N'Brighton & Hove Albion', N'newcastle-united-vs-brighton-hove-albion-round-2', '2026-08-23T18:30:00', 0),
    (2, 5, N'West Ham United', N'Brentford', N'west-ham-united-vs-brentford-round-2', '2026-08-23T21:00:00', 0),
    (2, 6, N'Crystal Palace', N'Everton', N'crystal-palace-vs-everton-round-2', '2026-08-24T01:00:00', 0),
    (2, 7, N'Leeds United', N'Fulham', N'leeds-united-vs-fulham-round-2', '2026-08-24T18:30:00', 0),
    (2, 8, N'Nottingham Forest', N'Burnley', N'nottingham-forest-vs-burnley-round-2', '2026-08-24T21:00:00', 0),
    (2, 9, N'Sunderland', N'AFC Bournemouth', N'sunderland-vs-afc-bournemouth-round-2', '2026-08-25T00:30:00', 0),
    (2, 10, N'Wolverhampton Wanderers', N'Aston Villa', N'wolverhampton-wanderers-vs-aston-villa-round-2', '2026-08-25T03:00:00', 0),

    (3, 1, N'Manchester United', N'Manchester City', N'manchester-united-vs-manchester-city-round-3', '2026-08-29T18:30:00', 1),
    (3, 2, N'Arsenal', N'Tottenham Hotspur', N'arsenal-vs-tottenham-hotspur-round-3', '2026-08-29T21:00:00', 1),
    (3, 3, N'Chelsea', N'Liverpool', N'chelsea-vs-liverpool-round-3', '2026-08-30T16:00:00', 0),
    (3, 4, N'Brighton & Hove Albion', N'Aston Villa', N'brighton-hove-albion-vs-aston-villa-round-3', '2026-08-30T18:30:00', 0),
    (3, 5, N'Brentford', N'Newcastle United', N'brentford-vs-newcastle-united-round-3', '2026-08-30T21:00:00', 0),
    (3, 6, N'Everton', N'West Ham United', N'everton-vs-west-ham-united-round-3', '2026-08-31T01:00:00', 0),
    (3, 7, N'Fulham', N'Crystal Palace', N'fulham-vs-crystal-palace-round-3', '2026-08-31T18:30:00', 0),
    (3, 8, N'Burnley', N'Leeds United', N'burnley-vs-leeds-united-round-3', '2026-08-31T21:00:00', 0),
    (3, 9, N'AFC Bournemouth', N'Nottingham Forest', N'afc-bournemouth-vs-nottingham-forest-round-3', '2026-09-01T00:30:00', 0),
    (3, 10, N'Wolverhampton Wanderers', N'Sunderland', N'wolverhampton-wanderers-vs-sunderland-round-3', '2026-09-01T03:00:00', 0),

    (4, 1, N'Liverpool', N'Manchester City', N'liverpool-vs-manchester-city-round-4', '2026-09-05T18:30:00', 0),
    (4, 2, N'Chelsea', N'Tottenham Hotspur', N'chelsea-vs-tottenham-hotspur-round-4', '2026-09-05T21:00:00', 0),
    (4, 3, N'Arsenal', N'Manchester United', N'arsenal-vs-manchester-united-round-4', '2026-09-06T16:00:00', 0),
    (4, 4, N'Aston Villa', N'Brentford', N'aston-villa-vs-brentford-round-4', '2026-09-06T18:30:00', 0),
    (4, 5, N'Newcastle United', N'Everton', N'newcastle-united-vs-everton-round-4', '2026-09-06T21:00:00', 0),
    (4, 6, N'West Ham United', N'Fulham', N'west-ham-united-vs-fulham-round-4', '2026-09-07T01:00:00', 0),
    (4, 7, N'Crystal Palace', N'Burnley', N'crystal-palace-vs-burnley-round-4', '2026-09-07T18:30:00', 0),
    (4, 8, N'Leeds United', N'AFC Bournemouth', N'leeds-united-vs-afc-bournemouth-round-4', '2026-09-07T21:00:00', 0),
    (4, 9, N'Nottingham Forest', N'Wolverhampton Wanderers', N'nottingham-forest-vs-wolverhampton-wanderers-round-4', '2026-09-08T00:30:00', 0),
    (4, 10, N'Sunderland', N'Brighton & Hove Albion', N'sunderland-vs-brighton-hove-albion-round-4', '2026-09-08T03:00:00', 0),

    (5, 1, N'Arsenal', N'Manchester City', N'arsenal-vs-manchester-city-round-5', '2026-09-12T18:30:00', 0),
    (5, 2, N'Manchester United', N'Chelsea', N'manchester-united-vs-chelsea-round-5', '2026-09-12T21:00:00', 0),
    (5, 3, N'Tottenham Hotspur', N'Liverpool', N'tottenham-hotspur-vs-liverpool-round-5', '2026-09-13T16:00:00', 0),
    (5, 4, N'Brentford', N'Brighton & Hove Albion', N'brentford-vs-brighton-hove-albion-round-5', '2026-09-13T18:30:00', 0),
    (5, 5, N'Everton', N'Aston Villa', N'everton-vs-aston-villa-round-5', '2026-09-13T21:00:00', 0),
    (5, 6, N'Fulham', N'Newcastle United', N'fulham-vs-newcastle-united-round-5', '2026-09-14T01:00:00', 0),
    (5, 7, N'Burnley', N'West Ham United', N'burnley-vs-west-ham-united-round-5', '2026-09-14T18:30:00', 0),
    (5, 8, N'AFC Bournemouth', N'Crystal Palace', N'afc-bournemouth-vs-crystal-palace-round-5', '2026-09-14T21:00:00', 0),
    (5, 9, N'Wolverhampton Wanderers', N'Leeds United', N'wolverhampton-wanderers-vs-leeds-united-round-5', '2026-09-15T00:30:00', 0),
    (5, 10, N'Sunderland', N'Nottingham Forest', N'sunderland-vs-nottingham-forest-round-5', '2026-09-15T03:00:00', 0);

INSERT INTO [Matches] ([Slug], [Competition], [HomeTeamId], [AwayTeamId], [StadiumId], [SeasonId], [RoundId], [KickoffTime], [Status], [IsFeatured])
SELECT
    f.[Slug],
    N'Premier League',
    homeClub.[Id],
    awayClub.[Id],
    COALESCE(homeStadium.[Id], @FallbackStadiumId),
    @SeasonId,
    roundEntity.[Id],
    f.[KickoffTime],
    N'Scheduled',
    f.[IsFeatured]
FROM @Fixtures f
INNER JOIN [Clubs] homeClub ON homeClub.[Name] = f.[HomeName] AND homeClub.[IsActive] = 1
INNER JOIN [Clubs] awayClub ON awayClub.[Name] = f.[AwayName] AND awayClub.[IsActive] = 1
INNER JOIN [MatchRounds] roundEntity ON roundEntity.[SeasonId] = @SeasonId AND roundEntity.[RoundNumber] = f.[RoundNumber]
LEFT JOIN @StadiumMap stadiumMap ON stadiumMap.[ClubName] = f.[HomeName]
LEFT JOIN [Stadiums] homeStadium ON homeStadium.[Name] = stadiumMap.[StadiumName]
WHERE homeClub.[Id] <> awayClub.[Id]
  AND NOT EXISTS (SELECT 1 FROM [Matches] existing WHERE existing.[Slug] = f.[Slug])
  AND NOT EXISTS
  (
      SELECT 1
      FROM [Matches] existing
      WHERE existing.[RoundId] = roundEntity.[Id]
        AND (
            existing.[HomeTeamId] IN (homeClub.[Id], awayClub.[Id])
            OR existing.[AwayTeamId] IN (homeClub.[Id], awayClub.[Id])
        )
  );
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DELETE FROM [Matches]
WHERE [Slug] IN
(
    N'manchester-united-vs-liverpool-round-1',
    N'arsenal-vs-chelsea-round-1',
    N'manchester-city-vs-tottenham-hotspur-round-1',
    N'aston-villa-vs-newcastle-united-round-1',
    N'brighton-hove-albion-vs-west-ham-united-round-1',
    N'brentford-vs-crystal-palace-round-1',
    N'everton-vs-leeds-united-round-1',
    N'fulham-vs-nottingham-forest-round-1',
    N'burnley-vs-sunderland-round-1',
    N'afc-bournemouth-vs-wolverhampton-wanderers-round-1',
    N'chelsea-vs-manchester-city-round-2',
    N'liverpool-vs-arsenal-round-2',
    N'tottenham-hotspur-vs-manchester-united-round-2',
    N'newcastle-united-vs-brighton-hove-albion-round-2',
    N'west-ham-united-vs-brentford-round-2',
    N'crystal-palace-vs-everton-round-2',
    N'leeds-united-vs-fulham-round-2',
    N'nottingham-forest-vs-burnley-round-2',
    N'sunderland-vs-afc-bournemouth-round-2',
    N'wolverhampton-wanderers-vs-aston-villa-round-2',
    N'manchester-united-vs-manchester-city-round-3',
    N'arsenal-vs-tottenham-hotspur-round-3',
    N'chelsea-vs-liverpool-round-3',
    N'brighton-hove-albion-vs-aston-villa-round-3',
    N'brentford-vs-newcastle-united-round-3',
    N'everton-vs-west-ham-united-round-3',
    N'fulham-vs-crystal-palace-round-3',
    N'burnley-vs-leeds-united-round-3',
    N'afc-bournemouth-vs-nottingham-forest-round-3',
    N'wolverhampton-wanderers-vs-sunderland-round-3',
    N'liverpool-vs-manchester-city-round-4',
    N'chelsea-vs-tottenham-hotspur-round-4',
    N'arsenal-vs-manchester-united-round-4',
    N'aston-villa-vs-brentford-round-4',
    N'newcastle-united-vs-everton-round-4',
    N'west-ham-united-vs-fulham-round-4',
    N'crystal-palace-vs-burnley-round-4',
    N'leeds-united-vs-afc-bournemouth-round-4',
    N'nottingham-forest-vs-wolverhampton-wanderers-round-4',
    N'sunderland-vs-brighton-hove-albion-round-4',
    N'arsenal-vs-manchester-city-round-5',
    N'manchester-united-vs-chelsea-round-5',
    N'tottenham-hotspur-vs-liverpool-round-5',
    N'brentford-vs-brighton-hove-albion-round-5',
    N'everton-vs-aston-villa-round-5',
    N'fulham-vs-newcastle-united-round-5',
    N'burnley-vs-west-ham-united-round-5',
    N'afc-bournemouth-vs-crystal-palace-round-5',
    N'wolverhampton-wanderers-vs-leeds-united-round-5',
    N'sunderland-vs-nottingham-forest-round-5'
);

DELETE roundEntity
FROM [MatchRounds] roundEntity
INNER JOIN [Seasons] season ON season.[Id] = roundEntity.[SeasonId]
WHERE season.[Name] = N'2026-2027'
  AND roundEntity.[RoundNumber] IN (2, 3, 4, 5)
  AND NOT EXISTS (SELECT 1 FROM [Matches] match WHERE match.[RoundId] = roundEntity.[Id]);
");
        }
    }
}
