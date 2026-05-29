namespace BaseCore.Entities
{
    public class CartItem
    {
        public int Id { get; set; }
        public int CartId { get; set; }
        public int TicketListingId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Cart Cart { get; set; }
        public TicketListing TicketListing { get; set; }
    }
}
