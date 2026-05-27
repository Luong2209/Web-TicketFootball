namespace BaseCore.Entities
{
    public class TicketListing
    {
        public int Id { get; set; }
        public int MatchId { get; set; }
        public int StadiumSectionId { get; set; }
        public string Title { get; set; } = "";
        public string RowLabel { get; set; } = "";
        public string SellerName { get; set; } = "";
        public string TicketType { get; set; } = "standard";
        public decimal UnitPrice { get; set; }
        public int AvailableQuantity { get; set; }
        public string DeliveryMethod { get; set; } = "Mobile Tickets";
        public bool IsVerified { get; set; } = true;

        public FootballMatch Match { get; set; }
        public StadiumSection StadiumSection { get; set; }
        public List<TicketOrderItem> TicketOrderItems { get; set; } = new();
        public List<CartItem> CartItems { get; set; } = new();
    }
}
